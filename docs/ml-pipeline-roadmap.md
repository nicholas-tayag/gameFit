# GameFit AI / ML Pipeline Roadmap

GameFit should be framed as an explainable game recommendation system, not just a quiz. The current MVP is a local-first content-based recommender that maps a player profile against a curated game catalog. The next versions can make the project credible for both AI engineering and software engineering by expanding the feature space, adding offline evaluation, and learning from anonymous feedback.

## Current Baseline

The production app currently uses:

- A quiz-derived `SkillProfile`.
- Micro / Meso / Macro axis scores.
- A deeper skill taxonomy for sub-skill signals such as aim, movement, timing, pattern reading, positioning, adaptation, strategy, resource management, build planning, map control, and team coordination.
- Static catalog features from `src/data/catalog.ts`.
- Explainable hybrid scoring in `src/lib/recommendations.ts`.
- Feature extraction in `src/lib/mlFeatures.ts`.

This is the baseline model. It is deterministic, explainable, testable, and deployable without accounts or a backend.

## Taxonomy

GameFit uses a hierarchical feature space:

- **Micro**: aim, movement, timing, reaction, input precision.
- **Meso**: pattern reading, positioning, adaptation, risk assessment.
- **Macro**: strategy, resource management, build planning, map control, team coordination.
- **Friction**: punishment, grind, ambiguity, team pressure, story density, navigation burden, system complexity.
- **Context**: session length, platform, genre, difficulty feel, multiplayer pressure.

The taxonomy lives in `src/data/skillTaxonomy.ts`. The important design choice is that recommendations are based on gameplay demands, not just genre labels.

## Model Phases

### Phase 1: Explainable Content-Based Recommender

Use engineered features:

- Player axis vector.
- Player sub-skill vector.
- Game axis vector.
- Inferred or curated game sub-skill vector.
- Liked and disliked friction tags.
- Session length and platform metadata.

Score blend:

```txt
finalScore =
  axisSimilarity * 0.56 +
  subSkillSimilarity * 0.34 +
  frictionBonuses -
  frictionPenalties
```

The exact weights can be adjusted through offline evaluation.

### Phase 2: Embedding-Assisted Catalog Enrichment

Generate text descriptions for each game:

```txt
Valorant is a tactical shooter that emphasizes aim, crosshair placement, map control,
positioning, team utility, economy management, and opponent prediction.
```

Use embeddings to:

- Suggest missing skill tags.
- Find similar games.
- Cluster the catalog.
- Match unknown top-three favorite games to known titles.
- Detect games that are under-described.

Embeddings should enrich the catalog, not replace explainable taxonomy reasons.

### Phase 3: Anonymous Feedback Learning

No accounts are required. Store privacy-friendly feedback events:

```ts
type FeedbackEvent = {
  anonymousId: string
  event: 'recommendation_clicked' | 'good_match' | 'not_for_me' | 'already_played'
  profileVector: number[]
  gameId: string
  rank: number
  matchScore: number
  timestamp: string
}
```

Start local-only, then add an optional backend once traffic is real.

### Phase 4: Learning-To-Rank

Once feedback exists, train an offline ranking model with features such as:

- Axis similarity.
- Sub-skill similarity.
- Friction overlap.
- Distance between player and game vectors.
- Session length fit.
- Genre/platform fit.
- Prior click/positive feedback rate.

Useful model choices:

- Logistic regression as a transparent baseline.
- Gradient boosted trees for tabular ranking.
- LightGBM / XGBoost ranking when there is enough data.
- A small neural ranker only after the feature pipeline and evaluation are stable.

## Evaluation

Add an offline evaluation harness before claiming the model improved.

Metrics:

- `Precision@K`
- `NDCG@K`
- `MRR`
- recommendation coverage
- recommendation diversity
- friction false-positive rate
- calibration of `High`, `Medium`, and `Exploratory` confidence labels

Test sets:

- Synthetic Micro-heavy profiles.
- Synthetic Meso-heavy profiles.
- Synthetic Macro-heavy profiles.
- Mixed profiles.
- Profiles that dislike punishing execution.
- Profiles that dislike open-ended navigation.
- Profiles that prefer short sessions.

## Privacy And Abuse

The default product should stay accountless.

- Do not require sign-in to get recommendations.
- Do not store raw free text unless a future privacy notice explains it.
- Prefer coarse feedback buttons over free text.
- Keep API keys and embedding generation on the server side.
- Rate-limit feedback endpoints if a backend is added.
- Make analytics anonymous and optional.

## Resume Framing

Strong resume language:

> Built an explainable game recommendation engine using hierarchical gameplay skill vectors, friction modeling, hybrid content-based ranking, and a roadmap for embedding-assisted catalog enrichment and feedback-driven learning-to-rank.

This demonstrates:

- product engineering
- TypeScript data modeling
- recommendation systems
- feature engineering
- explainability
- evaluation planning
- privacy-aware architecture
