// lib/mock/raw-reality.ts
//
// Seeded journal entries — the raw sample bank for the Reality Flipper.
// Voice per Appendix F: first-person, unpunctuated where that's honest,
// specific rather than moody in the abstract. This is what a Noida data
// engineer's 2am brain actually sounds like, not product copy.
import type { RealityEntry } from '@/lib/types/reality';

export const rawRealityEntries: RealityEntry[] = [
  {
    id: 're-001',
    createdAt: '2026-02-03T02:14:00.000Z',
    body:
      "migration failed at 1:47am threw a foreign key error on a table that hasn't changed in eight months rolled back and the rollback took eleven minutes longer than the migration itself sat there watching a progress bar undo my own work and thought this is the most honest hour of my day",
    tags: ['work', 'tech'],
    mood: 'hollow',
  },
  {
    id: 're-002',
    createdAt: '2026-02-04T09:22:00.000Z',
    body:
      "took the yellow line at 9:10 because the DND flyover was showing forty minutes on maps got to sector 18 in eighteen minutes felt like i'd beaten the system then remembered the system is not the metro the system is being awake for this at all",
    tags: ['commute'],
    mood: 'flat',
  },
  {
    id: 're-003',
    createdAt: '2026-02-04T10:05:00.000Z',
    body:
      "standup again blocked on access again fourth day saying the same sentence to the same eight faces on the same call jira ticket still sitting in someone else's queue i have started saying it with less shame than day one which might be its own kind of growth",
    tags: ['work'],
    mood: 'flat',
  },
  {
    id: 're-004',
    createdAt: '2026-02-05T20:40:00.000Z',
    body:
      "appraisal call today manager said impact eleven times i counted on a sticky note like it was a drinking game impact on the roadmap impact on the org impact on my growth journey nobody said the word salary until minute thirty four",
    tags: ['work', 'money'],
    mood: 'bitter',
  },
  {
    id: 're-005',
    createdAt: '2026-02-06T23:58:00.000Z',
    body:
      "office floor at eleven pm cyber hub tower lit up like someone forgot to tell the lights the building is empty one other laptop glowing three rows down don't know his name know his slack status says in a meeting it has said that since 7pm",
    tags: ['work'],
    mood: 'hollow',
  },
  {
    id: 're-006',
    createdAt: '2026-02-07T18:30:00.000Z',
    body:
      "papa asked again when the government job is coming told him the package is better here he said package doesn't sit next to you at your sister's wedding didn't have an answer for that drove back thinking in two languages and landing in neither",
    tags: ['family'],
    mood: 'bitter',
  },
  {
    id: 're-007',
    createdAt: '2026-02-08T14:12:00.000Z',
    body:
      "airflow dag failed silently for six hours nobody paged because the alert threshold was set by someone who left in november found it by accident while checking something unrelated the data was wrong in three dashboards a VP was already looking at",
    tags: ['work', 'tech'],
    mood: 'wired',
  },
  {
    id: 're-008',
    createdAt: '2026-02-09T21:05:00.000Z',
    body:
      "kafka consumer lag climbing all afternoon watched the graph the way you watch a kettle except the kettle is your on-call week and everyone else's sprint depends on it not boiling over",
    tags: ['work', 'tech'],
    mood: 'wired',
  },
  {
    id: 're-009',
    createdAt: '2026-02-10T22:47:00.000Z',
    body:
      "ex texted happy birthday two days late said she saw it on instagram and remembered i didn't reply for six hours then wrote thanks and nothing else felt like the most efficient conversation i've had all year",
    tags: ['ex'],
    mood: 'flat',
  },
  {
    id: 're-010',
    createdAt: '2026-02-11T07:50:00.000Z',
    body:
      "sprint planning at 8am estimated a three day ticket at five days everyone nodded like the number meant something we all know the real estimate is however long it takes plus however long the staging environment is down for no reason",
    tags: ['work'],
    mood: 'flat',
  },
  {
    id: 're-011',
    createdAt: '2026-02-12T23:15:00.000Z',
    body:
      "notice period math again if i give it now it lands during the release freeze if i wait it lands during appraisal cycle either way somebody's calendar owns my exit before i do",
    tags: ['work', 'money'],
    mood: 'defiant',
  },
  {
    id: 're-012',
    createdAt: '2026-02-13T19:00:00.000Z',
    body:
      "mom asked what exactly do you do beta explained pipeline and staging and rollback in hindi and english both failed halfway settled on main data ko sahi jagah pehochata hoon she said accha like that settled it maybe it did",
    tags: ['family'],
    mood: 'flat',
  },
  {
    id: 're-013',
    createdAt: '2026-02-14T02:30:00.000Z',
    body:
      "another 2am another rollback this one my fault forgot a where clause deleted rows i shouldn't have restored from backup by 3am wrote the postmortem by 4 slept by 5 alarm at 8 called it a normal tuesday because it was",
    tags: ['work', 'tech'],
    mood: 'hollow',
  },
  {
    id: 're-014',
    createdAt: '2026-02-15T13:20:00.000Z',
    body:
      "cousin's shaadi in gurgaon this weekend everyone will ask about the promotion nobody will ask if i'm sleeping i have an answer ready for the first question and none for the second which tells you which one i actually think about",
    tags: ['family'],
    mood: 'bitter',
  },
  {
    id: 're-015',
    createdAt: '2026-02-16T16:45:00.000Z',
    body:
      "blue line was down aqua line was packed took an auto from botanical garden the driver had the same radio station my father used to play in the nineties felt like the city playing a rerun just for me for eleven minutes then it ended and the meeting invite was already blinking",
    tags: ['commute'],
    mood: 'flat',
  },
  {
    id: 're-016',
    createdAt: '2026-02-17T22:10:00.000Z',
    body:
      "rewrote the same email four times trying to say the deadline slipped without saying the deadline slipped realized i am more fluent in corporate hedging than i am in either language i actually grew up speaking that should scare me more than it does",
    tags: ['work'],
    mood: 'defiant',
  },
];
