import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowRightIcon,
  BrainIcon,
  ExternalLinkIcon,
  GaugeIcon,
  Layers3Icon,
  RotateCcwIcon,
  SwordsIcon,
  TargetIcon,
  TrophyIcon,
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
import { gameCatalog } from './data/catalog'
import { quizQuestions } from './data/quiz'
import { buildProfile, describeDislikedGame, recommendGames } from './lib/recommendations'
import type { Axis, AxisScores } from './types'
import './App.css'

type AppStage = 'landing' | 'quiz' | 'results'

const storageKey = 'gamefit:v2'

interface SavedState {
  answers: Record<string, string>
  currentIndex: number
  dislikedGameId: string
  stage: AppStage
}

const axes: Axis[] = ['micro', 'meso', 'macro']

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

  const currentQuestion = quizQuestions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const progress = Math.round((answeredCount / quizQuestions.length) * 100)
  const profile = useMemo(() => buildProfile(answers), [answers])
  const recommendations = useMemo(() => recommendGames(profile, dislikedGameId, 8), [dislikedGameId, profile])
  const dislikedReflection = describeDislikedGame(profile, dislikedGameId)
  const selectedAnswer = answers[currentQuestion.id]
  useEffect(() => {
    const state: SavedState = { answers, currentIndex, dislikedGameId, stage }
    window.localStorage.setItem(storageKey, JSON.stringify(state))
  }, [answers, currentIndex, dislikedGameId, stage])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [currentIndex, stage])

  const startQuiz = () => {
    setStage('quiz')
    setCurrentIndex(0)
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
    setStage('landing')
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
      <motion.main className="landing-stage" key="landing" {...pageMotion}>
      <section className="landing-hero">
        <div className="hero-copy">
          <div className="landing-brand" aria-label="GameFit">
            <span>GF</span>
            GameFit
          </div>
          <h1>Find games that fit how you like to learn, fail, and improve.</h1>
          <p>
            GameFit maps your play preferences across Micro, Meso, and Macro challenge loops, then
            recommends games with clear reasons instead of vague genre labels.
          </p>
          <div className="hero-actions">
            <Button className="hero-primary-cta" size="lg" onClick={startQuiz}>
              Start the GameFit quiz
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href={sourceVideoUrl} target="_blank" rel="noreferrer">
                Source video
              </a>
            </Button>
          </div>
          <p className="source-line">
            Inspired by {sourceCreator}'s YouTube video{' '}
            <a href={sourceVideoUrl} target="_blank" rel="noreferrer">
              “{sourceVideoTitle}”
            </a>
            .
          </p>
        </div>

        <div className="hero-visual" aria-label="Micro Meso Macro gameplay map preview">
          <div className="orbit-card micro-card">
            <TargetIcon />
            <span>Micro</span>
          </div>
          <div className="orbit-card meso-card">
            <BrainIcon />
            <span>Meso</span>
          </div>
          <div className="orbit-card macro-card">
            <Layers3Icon />
            <span>Macro</span>
          </div>
          <ProfileDiagram scores={{ micro: 72, meso: 86, macro: 58 }} />
        </div>
      </section>

      <section className="idea-section" id="idea">
        <div className="section-title">
          <div>
            <Badge variant="outline">The idea</Badge>
            <h2>Genres tell you what a game is. Skill loops tell you how it feels.</h2>
          </div>
          <p>
            Elden Ring, Rocket League, Baldur's Gate 3, and Hades can all be “good games” while asking
            for completely different kinds of patience, attention, and mastery.
          </p>
        </div>

        <div className="definition-grid">
          <DefinitionCard axis="micro" icon={<SwordsIcon />} />
          <DefinitionCard axis="meso" icon={<GaugeIcon />} />
          <DefinitionCard axis="macro" icon={<TrophyIcon />} />
        </div>
      </section>

      <section className="quiz-preview-section">
        <Card className="wide-cta-card">
          <CardHeader>
            <CardTitle>Take a full-screen archetype-style quiz</CardTitle>
            <CardDescription>
              Answer short scenario questions, watch the profile tune itself, then land on a completion
              page with your lean, mismatch explanations, and recommended games.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="preview-steps">
              <span>1. Answer scenarios</span>
              <span>2. Tune the profile</span>
              <span>3. Reveal recommendations</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="hero-primary-cta" size="lg" onClick={startQuiz}>
              Enter quiz page
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </CardFooter>
        </Card>
      </section>
      </motion.main>
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

function DefinitionCard({ axis, icon }: { axis: Axis; icon: ReactNode }) {
  return (
    <Card className={`definition-card ${axis}`}>
      <CardHeader>
        <div className="definition-icon">{icon}</div>
        <CardTitle>{axisCopy[axis].label}</CardTitle>
        <CardDescription>{axisCopy[axis].short}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{axisCopy[axis].description}</p>
      </CardContent>
    </Card>
  )
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

function AxisBars({ scores }: { scores: AxisScores }) {
  return (
    <div className="axis-list">
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
