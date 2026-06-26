# GameFit

GameFit is a landing-page plus quiz-first React/Vite MVP for helping players find games that fit how they like to learn, fail, improve, and spend time.

The core product idea is a short diagnostic that maps a player's preferences across three axes:

- **Micro**: execution, timing, aim, movement, dexterity, and fast feedback loops.
- **Meso**: situational reads, adaptation, tactics, pattern recognition, and moment-to-moment judgment.
- **Macro**: planning, systems, builds, routes, progression, economy, and long-horizon strategy.

The v1 experience starts with a public-facing landing page that explains the idea, defines Micro/Meso/Macro in simple gameplay terms, cites the source inspiration video, and pushes users into a pre-quiz taste seed. Players can enter up to three games they already love, get a quick local-catalog read from the GameFit guide, then continue into a full-screen archetype-style quiz. The quiz completes into a profile/results page with a radar-style lean diagram, bounce-off reflection, and local-catalog recommendations.

Source inspiration: Surnex's YouTube video [“Once you see this, You'll see Competitive Games Differently”](https://www.youtube.com/watch?v=NgHvdCcmQ4o). I want to credit the creator for making such an interesting video that it pushed me to turn the idea into a real project.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui source components
- lucide-react icons
- Motion for React
- Vitest
- Oxlint
- Local TypeScript data catalog, with no backend required for v1

## Product Flow

1. **Landing page**: explains GameFit, Micro/Meso/Macro, and credits Surnex's YouTube source.
2. **Taste seed page**: asks for up to three favorite games and gives a quick Micro/Meso/Macro hint from recognized catalog matches.
3. **Quiz page**: full-screen scenario questions with shadcn `ToggleGroup` answer controls.
4. **Completion page**: shows current lean, radar diagram, axis bars, disliked-game reflection, and recommended games.

## Local Setup

Use `pnpm`; the repository includes a `pnpm-lock.yaml`.

```bash
pnpm install
pnpm dev
```

The dev server prints a local URL, usually `http://localhost:5173`.

## Commands

```bash
pnpm dev
```

Run the local Vite development server.

```bash
pnpm test
```

Run the Vitest recommendation tests.

```bash
pnpm lint
```

Run Oxlint.

```bash
pnpm build
```

Type-check and create the production build in `dist/`.

```bash
pnpm preview
```

Preview the production build locally after `pnpm build`.

## Deployment

For the MVP, deploy GameFit as a static Vite app. Vercel or Netlify are both good fits because v1 does not need a server, database, or authenticated API.

Recommended default: **Vercel static deployment**.

- Framework preset: Vite
- Install command: `pnpm install`
- Build command: `pnpm build`
- Output directory: `dist`
- Environment variables: none required for client-side-only v1

Netlify works with the same shape:

- Build command: `pnpm build`
- Publish directory: `dist`

Before sharing a public link, run:

```bash
pnpm test
pnpm lint
pnpm build
```

## Privacy

GameFit v1 should be client-side only. Quiz answers, disliked-game selections, profiles, and recommendations can be computed locally in the browser from the bundled catalog.

Until accounts, analytics, or a backend are added, the product should not claim to store profiles or personalize across visits. If lightweight analytics are introduced later, add a visible privacy note that explains what events are collected and why.

## MVP 1 Goals

- Make the landing page understandable without prior context.
- Help users start the quiz quickly with a visible primary action.
- Use top-three favorite games as a lightweight onboarding signal before the scenario quiz.
- Explain recommendations through fit and friction, not vague genre matching.
- Keep the current MVP deployable as a static app.
- Treat user profiles, saved results, and usage stats as future roadmap work, not hidden v1 behavior.

## Future User Profiles And Stats

Future versions should consider optional accounts or local-first profiles so users can save results, retake the quiz, track how their taste changes, and mark games as tried, loved, skipped, or bounced off. Usage stats should start privacy-friendly and answer product questions like quiz starts, quiz completions, result views, recommendation clicks, and whether users found the profile accurate.

The top-three-games step should eventually feed a larger catalog and feedback loop: unknown titles can become demand signals for what games to add next, while recognized favorites can help compare inferred quiz profiles against actual taste.

## MVP Acquisition Notes

The first public version should be credible enough to send to real players, even if the catalog and scoring model are still small.

Good early acquisition channels:

- Posts in genre-specific communities asking "what games should I try next?" with a short demo link.
- TikTok, YouTube Shorts, or Reddit posts showing surprising recommendation outcomes.
- Landing copy focused on player fit, not "AI recommendations."
- Shareable result screenshots or short result summaries for organic spread.
- Feedback prompts after results: "Was this accurate?", "What did it miss?", and "What game did you bounce off?"

Useful MVP success signals:

- Quiz completion rate.
- Clicks on recommended games.
- Percentage of users who say the profile felt accurate.
- Games that frequently appear as disliked or poor-fit inputs.
- Search/source terms that bring high-intent players.

Avoid overfitting the early product to one community. The Micro/Meso/Macro frame should work for cozy, competitive, narrative, action, strategy, and sandbox players.

## Future Iterations

See [docs/future-iterations.md](/Users/nicky/GithubRepos/gamefit/docs/future-iterations.md) for a staged roadmap covering accounts, analytics, catalog expansion, APIs, and community features.
