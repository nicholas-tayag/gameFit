# Future Iterations

This roadmap keeps the MVP simple while leaving clear paths toward a more durable product.

## 1. Stronger Client-Side MVP

- Finish the quiz-first flow: intro, questions, optional disliked-game input, results, and restart/share affordances.
- Make each recommendation explain its fit across Micro, Meso, and Macro.
- Add mismatch language so users understand why popular games may not be right for them.
- Expand the local catalog with better platform, genre, session-length, accessibility, and friction metadata.
- Add static SEO pages for common intents such as "games like Hades but less punishing" or "strategy games for beginners."

## 2. Lightweight Analytics

- Track anonymous product events: quiz started, quiz completed, recommendation clicked, result shared, feedback submitted.
- Keep analytics privacy-preserving and avoid collecting raw free-text feedback unless there is a clear retention policy.
- Use analytics to improve question wording, catalog coverage, and recommendation explanations.
- Add a small stats dashboard later for owner-facing signals: active users, quiz starts, quiz completions, result views, top bounced-off games, and recommendation click-through.

## 3. Accounts And Saved Profiles

- Add optional accounts only after the anonymous experience proves useful.
- Let users save profiles, compare retakes, bookmark recommendations, and mark games as played, liked, disliked, or bounced.
- Support "recommend for me tonight" filters such as platform, time available, multiplayer preference, and energy level.
- Keep account creation optional so users can still take the quiz without signing in.

## 4. Catalog And Scoring System

- Move from a hand-maintained local catalog to a reviewed catalog pipeline.
- Add editorial fields for why a game is demanding, cozy, social, open-ended, punishing, or systems-heavy.
- Consider importing public metadata from third-party game databases, then layering GameFit-specific fit tags on top.
- Keep human review in the loop so recommendations remain credible and do not collapse into generic genre matching.

### Public Catalog Sources To Evaluate

- **RAWG:** useful for broad metadata, screenshots, release dates, genres, platform coverage, and discovery search. It can help users find titles quickly, but imported genres should not be treated as skill labels.
- **IGDB:** useful for a normalized game database, companies, platforms, releases, cover art, themes, and modes. Its free API is positioned for non-commercial usage under Twitch terms, so commercial plans need a terms review.
- **Steam Web API:** useful for official Steam app identifiers and Steam ecosystem hooks. Use it server-side when API keys are involved, and avoid making Steam the only catalog source.
- **SteamSpy:** useful for popularity estimates, owner ranges, and trend signals from Steam public-profile sampling. Treat it as directional evidence, not exact sales or quality data.
- **Kaggle / public snapshots:** useful for offline experiments and resume-ready ML evaluation, but verify licensing, freshness, and provenance before using them in production.

### Catalog Pipeline Goal

Start with the current reviewed seed catalog, then add an ingestion job that creates draft records:

1. Pull raw metadata from one or more sources.
2. Normalize titles, platforms, release dates, genres, tags, images, and Steam app IDs.
3. Generate candidate skill/friction tags with an LLM or embedding model.
4. Store drafts separately from approved catalog records.
5. Review and approve GameFit-specific labels before they affect recommendations.
6. Track recommendation feedback so future ranking models learn from real player behavior.

## 5. API And Backend

- Introduce a backend when the product needs saved profiles, moderation, catalog editing, user feedback storage, or partner integrations.
- Keep the recommendation engine deterministic and explainable before adding any machine-learning layer.
- Expose a small API for quiz results, catalog search, feedback capture, and user profile retrieval.

## 6. Community And Growth

- Add shareable profile cards and "compare my taste with a friend" flows.
- Let players submit games they bounced off and explain why.
- Build community pages around fit patterns, not just genres: execution-heavy, systems-heavy, cozy macro, social meso, and so on.
- Invite creators or curators to make recommended lists using the Micro/Meso/Macro model.

## 7. Trust And Privacy

- Publish clear privacy language before adding accounts or analytics.
- Give users control over deleting saved profiles and feedback.
- Separate anonymous analytics from account data where possible.
- Be explicit when recommendations are local, editorial, algorithmic, or personalized from saved history.

## 8. Source Credit

- Continue crediting Surnex's video, "Once you see this, You'll see Competitive Games Differently," as the project inspiration.
- Keep the credit visible in the README and in the product experience without implying endorsement.
