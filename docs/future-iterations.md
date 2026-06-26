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
