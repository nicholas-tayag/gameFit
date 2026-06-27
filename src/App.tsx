import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowRightIcon,
  ExternalLinkIcon,
  PlayIcon,
  PlusIcon,
  RotateCcwIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import gamefitIcon from './assets/gamefit/gamefit-icon.png'
import guideOrb from './assets/gamefit/guide-orb.png'
import { gameCatalog } from './data/catalog'
import { quizQuestions } from './data/quiz'
import { buildProfile, describeDislikedGame, recommendGames } from './lib/recommendations'
import { buildTasteSeedInsight, findTasteSeedGame } from './lib/tasteSeed'
import type { TasteSeedInsight } from './lib/tasteSeed'
import type { Axis, AxisScores } from './types'
import './App.css'

type AppStage = 'landing' | 'taste-seed' | 'quiz' | 'results'

const storageKey = 'gamefit:v2'

interface SavedState {
  answers: Record<string, string>
  currentIndex: number
  dislikedGameId: string
  topGames: string[]
  stage: AppStage
}

const axes: Axis[] = ['micro', 'meso', 'macro']
const defaultTopGames = ['Hades', "Baldur's Gate 3", 'Rocket League']

const axisCopy: Record<Axis, { label: string; short: string; description: string }> = {
  micro: {
    label: 'Micro',
    short: 'Moment-to-moment execution',
    description: 'Timing, aim, movement, dexterity, rhythm, reactions, and clean input under pressure.',
  },
  meso: {
    label: 'Meso',
    short: 'Adaptive situation reading',
    description: 'Reading uncertainty, adjusting to opponents or systems, improvising, and choosing under pressure.',
  },
  macro: {
    label: 'Macro',
    short: 'Long-horizon planning',
    description: 'Builds, routes, economies, team plans, progression, optimization, and consequences over time.',
  },
}

const initialState: SavedState = {
  answers: {},
  currentIndex: 0,
  dislikedGameId: 'elden-ring',
  topGames: defaultTopGames,
  stage: 'landing',
}

const loadSavedState = (): SavedState => {
  try {
    const stored = window.localStorage.getItem(storageKey)
    if (!stored) return initialState
    const parsed = JSON.parse(stored) as Partial<SavedState>
    return { ...initialState, ...parsed, stage: parsed.stage ?? 'landing' }
  } catch {
    return initialState
  }
}

const scorePath = (scores: AxisScores) => {
  const points = [
    [50, 8 + (100 - scores.micro) * 0.34],
    [10 + scores.meso * 0.34, 82],
    [90 - scores.macro * 0.34, 82],
  ]

  return points.map(([x, y]) => `${x},${y}`).join(' ')
}

const sourceVideoUrl = 'https://www.youtube.com/watch?v=NgHvdCcmQ4o'
const sourceVideoTitle = "Once you see this, You'll see Competitive Games Differently"
const sourceCreator = 'Surnex'

const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
  transition: { duration: 0.32, ease: 'easeOut' },
} as const

function App() {
  const savedState = useMemo(loadSavedState, [])
  const [stage, setStage] = useState<AppStage>(savedState.stage)
  const [answers, setAnswers] = useState<Record<string, string>>(savedState.answers)
  const [currentIndex, setCurrentIndex] = useState(savedState.currentIndex)
  const [dislikedGameId, setDislikedGameId] = useState(savedState.dislikedGameId)
  const [topGames, setTopGames] = useState<string[]>(
    savedState.topGames.length === 3 ? savedState.topGames : defaultTopGames,
  )

  const currentQuestion = quizQuestions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const progress = Math.round((answeredCount / quizQuestions.length) * 100)
  const profile = useMemo(() => buildProfile(answers), [answers])
  const tasteSeedInsight = useMemo(() => buildTasteSeedInsight(topGames), [topGames])
  const recommendations = useMemo(() => recommendGames(profile, dislikedGameId, 8), [dislikedGameId, profile])
  const dislikedReflection = describeDislikedGame(profile, dislikedGameId)
  const selectedAnswer = answers[currentQuestion.id]
  useEffect(() => {
    const state: SavedState = { answers, currentIndex, dislikedGameId, topGames, stage }
    window.localStorage.setItem(storageKey, JSON.stringify(state))
  }, [answers, currentIndex, dislikedGameId, stage, topGames])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [currentIndex, stage])

  const beginQuiz = () => {
    setStage('quiz')
    setCurrentIndex(0)
  }

  const updateTopGame = (index: number, value: string) => {
    setTopGames((games) => games.map((game, gameIndex) => (gameIndex === index ? value : game)))
  }

  const clearTopGame = (index: number) => {
    updateTopGame(index, '')
  }

  const chooseAnswer = (optionId: string) => {
    setAnswers((current) => ({ ...current, [currentQuestion.id]: optionId }))
  }

  const goNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex((index) => index + 1)
      return
    }
    setStage('results')
  }

  const goPrevious = () => {
    if (currentIndex === 0) {
      setStage('landing')
      return
    }
    setCurrentIndex((index) => Math.max(0, index - 1))
  }

  const resetQuiz = () => {
    setAnswers({})
    setCurrentIndex(0)
    setDislikedGameId('elden-ring')
    setTopGames(defaultTopGames)
    setStage('landing')
  }

  if (stage === 'taste-seed') {
    return (
      <OnboardingStage
        beginQuiz={beginQuiz}
        clearTopGame={clearTopGame}
        insight={tasteSeedInsight}
        topGames={topGames}
        updateTopGame={updateTopGame}
      />
    )
  }

  if (stage === 'quiz') {
    return (
      <motion.main className="quiz-stage" {...pageMotion}>
        <div className="quiz-chrome">
          <button className="brand-button" type="button" onClick={() => setStage('landing')}>
            <span>GF</span>
            GameFit
          </button>
          <div className="quiz-progress" aria-label={`Quiz progress ${progress}%`}>
            <div>
              <span>
                Question {currentIndex + 1} of {quizQuestions.length}
              </span>
              <strong>{progress}% tuned</strong>
            </div>
            <Progress value={progress} />
          </div>
          <Button variant="ghost" size="sm" onClick={resetQuiz}>
            <RotateCcwIcon data-icon="inline-start" />
            Reset
          </Button>
        </div>

        <section className="quiz-card-shell" aria-label="GameFit quiz question">
          <div className="quiz-question-copy">
            <p>Profile tuning</p>
            <h1>{currentQuestion.prompt}</h1>
            <span>{currentQuestion.context}</span>
          </div>

          <ToggleGroup
            className="answer-toggle-group"
            type="single"
            value={selectedAnswer ?? ''}
            onValueChange={(value) => {
              if (value) chooseAnswer(value)
            }}
            orientation="vertical"
            variant="outline"
          >
            {currentQuestion.options.map((option) => (
              <ToggleGroupItem className="answer-toggle" value={option.id} key={option.id}>
                <span>{option.label}</span>
                <small>{option.description}</small>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="quiz-footer">
            <Button variant="outline" size="lg" type="button" onClick={goPrevious}>
              Back
            </Button>
            <Button size="lg" type="button" onClick={goNext} disabled={!selectedAnswer}>
              {currentIndex === quizQuestions.length - 1 ? 'Reveal my profile' : 'Next question'}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </section>
      </motion.main>
    )
  }

  if (stage === 'results') {
    return (
      <motion.main className="results-stage" {...pageMotion}>
        <InlineUtility resetQuiz={resetQuiz} />

        <section className="results-hero">
          <div>
            <Badge variant="secondary">Quiz complete</Badge>
            <h1>Your gameplay shape is {axisCopy[profile.dominant].label} + {axisCopy[profile.secondary].label}</h1>
            <p>
              This is not a skill grade. It is a map of the challenge loops you are most likely to enjoy,
              tolerate, or bounce off when a game asks for your time.
            </p>
          </div>
          <ProfileDiagram scores={profile.scores} />
        </section>

        <section className="results-grid">
          <Card className="profile-report">
            <CardHeader>
              <CardTitle>Current lean</CardTitle>
              <CardDescription>{profile.explanation}</CardDescription>
              <CardAction>
                <Badge>{profile.confidence}% confidence</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <AxisBars scores={profile.scores} />
            </CardContent>
            <CardFooter>
              <p>
                Your strongest matches should explain both the appeal and the friction. A game can be great
                and still be wrong for your current taste, patience, or schedule.
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bounce-off reflection</CardTitle>
              <CardDescription>Compare your profile against one game that looked interesting but missed.</CardDescription>
            </CardHeader>
            <CardContent className="reflection-content">
              <Select value={dislikedGameId || 'none'} onValueChange={(value) => setDislikedGameId(value === 'none' ? '' : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a game" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">Skip for now</SelectItem>
                    {gameCatalog
                      .toSorted((a, b) => a.title.localeCompare(b.title))
                      .map((game) => (
                        <SelectItem value={game.id} key={game.id}>
                          {game.title}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p>{dislikedReflection ?? 'Choose a game to compare its friction against your profile.'}</p>
            </CardContent>
          </Card>
        </section>

        <section className="recommendations-section" id="recommendations" aria-label="Recommended games">
          <div className="section-title">
            <div>
              <Badge variant="outline">Recommended next plays</Badge>
              <h2>Games that fit your prospects</h2>
              <p>Ranked by skill profile fit, preferred friction, and mismatch warnings.</p>
            </div>
            <Button variant="outline" onClick={() => setStage('quiz')}>
              Retune answers
            </Button>
          </div>

          <div className="recommendation-grid">
            {recommendations.map((recommendation) => (
              <Card className="game-card" key={recommendation.game.id}>
                <div className="game-art" style={{ background: recommendation.game.color }}>
                  <span>{recommendation.matchScore}%</span>
                </div>
                <CardHeader>
                  <CardTitle>{recommendation.game.title}</CardTitle>
                  <CardDescription>{recommendation.game.genres.join(' / ')}</CardDescription>
                  <CardAction>
                    <Badge variant={recommendation.confidence === 'High' ? 'default' : 'secondary'}>
                      {recommendation.confidence}
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardContent className="game-card-content">
                  <div className="game-meta">
                    <Badge variant="outline">{recommendation.game.difficultyFeel}</Badge>
                    <Badge variant="outline">{recommendation.game.sessionLength}</Badge>
                    <Badge variant="outline">{recommendation.game.platforms.slice(0, 2).join(' / ')}</Badge>
                  </div>
                  <div className="reason-block">
                    <h3>Why this matches</h3>
                    <p>{recommendation.reasons[0]}</p>
                  </div>
                  <Separator />
                  <div className="reason-block">
                    <h3>Possible friction</h3>
                    <p>{recommendation.cautions[0] ?? 'No major mismatch from the preferences you have shared so far.'}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </motion.main>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <OnboardingStage
        beginQuiz={beginQuiz}
        clearTopGame={clearTopGame}
        insight={tasteSeedInsight}
        key="landing"
        topGames={topGames}
        updateTopGame={updateTopGame}
      />
    </AnimatePresence>
  )
}

function InlineUtility({ resetQuiz }: { resetQuiz: () => void }) {
  return (
    <div className="inline-utility" aria-label="Page utility actions">
      <a className="brand" href="/">
        <span className="brand-mark">GF</span>
        <span>GameFit</span>
      </a>
      <Button variant="outline" size="sm" asChild>
        <a href={sourceVideoUrl} target="_blank" rel="noreferrer">
          Source
          <ExternalLinkIcon data-icon="inline-end" />
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={resetQuiz}>
        <RotateCcwIcon data-icon="inline-start" />
        Reset
      </Button>
    </div>
  )
}

function OnboardingStage({
  beginQuiz,
  clearTopGame,
  insight,
  topGames,
  updateTopGame,
}: {
  beginQuiz: () => void
  clearTopGame: (index: number) => void
  insight: TasteSeedInsight
  topGames: string[]
  updateTopGame: (index: number, value: string) => void
}) {
  const focusGameInput = () => {
    const firstEmptyIndex = topGames.findIndex((game) => game.trim().length === 0)
    const input = document.getElementById(`top-game-${firstEmptyIndex === -1 ? 2 : firstEmptyIndex}`)
    input?.focus()
  }

  return (
    <motion.main className="onboarding-stage" {...pageMotion}>
      <div className="ice-mountain-scene" aria-hidden="true">
        <span className="ice-peak peak-one" />
        <span className="ice-peak peak-two" />
        <span className="ice-peak peak-three" />
      </div>

      <section className="onboarding-shell" aria-label="GameFit top games onboarding">
        <div className="onboarding-intro">
          <div className="mock-brand" aria-label="GameFit">
            <img src={gamefitIcon} alt="" />
            <strong>GameFit</strong>
          </div>

          <div className="mock-hero-copy">
            <h1>Start with the games that already clicked.</h1>
            <p>GameFit maps how you think, adapt, and decide--then matches you with games that fit.</p>
          </div>

          <a className="source-card" href={sourceVideoUrl} target="_blank" rel="noreferrer">
            <span>
              <PlayIcon />
            </span>
            <b>Inspired by Surnex's video</b>
            <small>“{sourceVideoTitle}”</small>
            <ExternalLinkIcon />
          </a>
        </div>

        <Card className="mock-onboarding-card">
          <CardContent>
            <div className="mock-games-column">
              <div className="mock-panel-title">
                <h2>Your top 3 games</h2>
                <p>Add the 3 games you've played and loved most.</p>
              </div>

              <div className="mock-game-list">
                {topGames.map((game, index) => (
                  <GameSeedRow
                    game={game}
                    index={index}
                    key={index}
                    onChange={(value) => updateTopGame(index, value)}
                    onClear={() => clearTopGame(index)}
                  />
                ))}
              </div>

              <button className="add-game-button" type="button" onClick={focusGameInput}>
                <PlusIcon />
                Add a different game
              </button>

              <Button className="mock-primary-cta" size="lg" type="button" onClick={beginQuiz}>
                <SparklesIcon data-icon="inline-start" />
                Begin tuning
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>

            <div className="mock-guide-column" aria-live="polite">
              <Card className="mock-guide-card">
                <CardHeader>
                  <div className="mock-guide-label">
                    <SparklesIcon />
                    <span>GameFit guide</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="guide-chat-row">
                    <div className="ai-face" aria-hidden="true">
                      <img src={guideOrb} alt="" />
                    </div>
                    <div className="guide-bubble">
                      <p>{insight.summary} The quiz will tune the details.</p>
                    </div>
                  </div>

                  <div className="gauge-panel">
                    {axes.map((axis) => (
                      <MiniGauge axis={axis} key={axis} value={insight.scores[axis]} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button className="mock-skip-button" variant="outline" size="lg" type="button" onClick={beginQuiz}>
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className="next-rail" aria-label="What happens next">
          <div className="next-copy">
            <h2>What happens next</h2>
            <p>A quick quiz, your profile, then game matches that fit you.</p>
          </div>
          <div className="next-step quiz-step">
            <span>01</span>
            <div>
              <h3>The quiz</h3>
              <p>Answer how you think, decide, and adapt.</p>
            </div>
            <div className="mini-question" aria-hidden="true">
              <small>When the game gets intense, you...</small>
              <b>Look for a smarter angle</b>
              <i />
            </div>
          </div>
          <div className="next-step profile-step">
            <span>02</span>
            <div>
              <h3>Your profile</h3>
              <p>See your Micro, Meso, Macro skills map.</p>
            </div>
            <ProfileDiagram scores={insight.scores} />
          </div>
          <div className="next-step matches-step">
            <span>03</span>
            <div>
              <h3>Game matches</h3>
              <p>Discover games that match how you think and play.</p>
            </div>
            <div className="mini-match-list" aria-hidden="true">
              {['XCOM 2', 'Slay the Spire', 'Hollow Knight'].map((title, index) => (
                <div key={title}>
                  <b>{title}</b>
                  <small>{[92, 86, 78][index]}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <a className="bottom-source-link" href={sourceVideoUrl} target="_blank" rel="noreferrer">
          <PlayIcon />
          Source: {sourceCreator} -- “{sourceVideoTitle}”
          <ExternalLinkIcon />
        </a>
      </section>
    </motion.main>
  )
}

function GameSeedRow({
  game,
  index,
  onChange,
  onClear,
}: {
  game: string
  index: number
  onChange: (value: string) => void
  onClear: () => void
}) {
  const match = findTasteSeedGame(game)
  const title = game.trim() || defaultTopGames[index]

  return (
    <div className="game-seed-row">
      <span className="seed-number">{index + 1}</span>
      <span className="seed-cover" style={{ '--seed-color': match?.color ?? '#175ec7' } as CSSProperties}>
        {gameInitials(title)}
      </span>
      <Input
        aria-label={`Game ${index + 1}`}
        id={`top-game-${index}`}
        value={game}
        onChange={(event) => onChange(event.target.value)}
        placeholder={defaultTopGames[index]}
      />
      <button aria-label={`Remove game ${index + 1}`} type="button" onClick={onClear}>
        <XIcon />
      </button>
    </div>
  )
}

function MiniGauge({ axis, value }: { axis: Axis; value: number }) {
  const level = value >= 72 ? 'High' : value >= 58 ? 'Medium-High' : value >= 42 ? 'Medium' : 'Light'
  const rotation = -118 + value * 1.55

  return (
    <div className={`mini-gauge ${axis}`}>
      <h3>{axisCopy[axis].label}</h3>
      <p>{axis === 'micro' ? 'Mechanics & Execution' : axis === 'meso' ? 'Systems & Interactions' : 'Strategy & Adaptation'}</p>
      <div className="gauge-arc" style={{ '--gauge-rotation': `${rotation}deg` } as CSSProperties}>
        <span />
      </div>
      <small>{level}</small>
    </div>
  )
}

function gameInitials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')
}

function ProfileDiagram({ scores }: { scores: AxisScores }) {
  return (
    <div className="profile-diagram">
      <svg viewBox="0 0 100 100" role="img" aria-label="Micro Meso Macro profile diagram">
        <polygon className="radar-grid outer" points="50,8 92,82 8,82" />
        <polygon className="radar-grid inner" points="50,31 72,70 28,70" />
        <line x1="50" y1="8" x2="50" y2="82" />
        <line x1="8" y1="82" x2="92" y2="82" />
        <line x1="50" y1="8" x2="8" y2="82" />
        <line x1="50" y1="8" x2="92" y2="82" />
        <polygon className="radar-shape" points={scorePath(scores)} />
        <circle cx="50" cy="8" r="2.8" />
        <circle cx="92" cy="82" r="2.8" />
        <circle cx="8" cy="82" r="2.8" />
      </svg>
      <div className="diagram-labels" aria-hidden="true">
        <span>Micro</span>
        <span>Meso</span>
        <span>Macro</span>
      </div>
    </div>
  )
}

function AxisBars({ scores, compact = false }: { scores: AxisScores; compact?: boolean }) {
  return (
    <div className={compact ? 'axis-list compact' : 'axis-list'}>
      {axes.map((axis) => (
        <div className="axis-row" key={axis}>
          <div>
            <strong>{axisCopy[axis].label}</strong>
            <span>{axisCopy[axis].description}</span>
          </div>
          <Progress value={scores[axis]} />
          <b>{scores[axis]}</b>
        </div>
      ))}
    </div>
  )
}

export default App
