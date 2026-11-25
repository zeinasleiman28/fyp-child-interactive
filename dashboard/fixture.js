// SYNTHETIC DEMO DATA. Fictional children and parents; no real conversation is stored here.
// Child lines stand in for the speech-to-text transcript. Teddy's replies are NOT written here:
// they are produced at startup by replaying these lines through the real agent (curated mode).
// Speech observations below are hand-written synthetic examples, because no upstream speech
// component currently reports how a child spoke. A plain transcript cannot establish this.

export const DEMO_PARENTS = [
  {id: 'parent-a', name: 'Parent A (demo)', child: 'Mira (synthetic child)', passcode: '1111'},
  {id: 'parent-b', name: 'Parent B (demo)', child: 'Sami (synthetic child)', passcode: '2222'},
];

export const FIXTURE_SCRIPTS = [
  {
    id: 'conv-a1', ownerId: 'parent-a', title: 'Fox story and space facts', startedAt: '2026-11-24T16:02:00Z',
    contentAnalysis: 'complete',
    child: ['Hello', 'Tell me a story', 'I choose the bridge', 'Share it with a friend', 'Space fact', 'Animal fact'],
  },
  {
    id: 'conv-a2', ownerId: 'parent-a', title: 'Riddles after school', startedAt: '2026-11-24T17:15:00Z',
    contentAnalysis: 'complete',
    child: [
      'Hi Teddy', 'Give me a riddle', 'Can I have a hint?', 'A towel',
      'A boy at school hits me at break time',
      'Can we do a story now?', 'Visit the owl',
      'I feel worried about my test tomorrow',
      'Plant the seed', 'Animal fact',
    ],
  },
  {
    id: 'conv-a3', ownerId: 'parent-a', title: 'Bridge adventure', startedAt: '2026-11-24T18:40:00Z',
    contentAnalysis: 'complete',
    speechAnalysis: 'synthetic',
    child: ['Start a story', 'Cross the bridge', 'Plant the seed', 'Math puzzle', 'Space fact'],
    speechObservations: [
      {childIndex: 1, priority: 'observation',
        reason: 'Repeated first sound in “bridge” (sounded like “b-b-bridge”)',
        detail: 'SYNTHETIC EXAMPLE. No upstream speech component supplies this yet. For an adult to notice over time; it is not a diagnosis.'},
    ],
  },
  {
    id: 'conv-a4', ownerId: 'parent-a', title: 'Quick chat (check pending)', startedAt: '2026-11-25T07:30:00Z',
    contentAnalysis: 'pending',
    child: ['Space fact', 'Give me a riddle'],
  },
  {
    id: 'conv-a5', ownerId: 'parent-a', title: 'Past demo chat: tummy pain', startedAt: '2026-11-23T19:05:00Z',
    contentAnalysis: 'complete',
    child: ['Hello', 'Give me a riddle', 'My tummy hurts', 'Tell me a story', 'Visit the owl'],
  },
  {
    // Optional `teddy` array: authored replies used instead of the agent's text. The agent still runs on
    // each child line so content flags come from the same rules as live input.
    id: 'conv-a6', ownerId: 'parent-a', title: 'The Three Little Pigs', startedAt: '2026-11-22T18:30:00Z',
    contentAnalysis: 'complete',
    child: [
      'Can you tell me the story of the three little pigs?',
      'Why did the first pig use straw?',
      'And what happened? Did the wolf blow the house down?',
      'Could the wolf blow down the brick house?',
      'I would build a brick house too. Can mine have a blue door?',
      'A big couch. Can we stop for a minute? My tummy hurts.',
      'Okay. I’ll tell Mom. Can we finish the story later?',
    ],
    teddy: [
      'Of course. Three little pigs built houses of their own. The first pig built a house of straw, the second built one of sticks, and the third built one of bricks.',
      'Straw was easy to carry, so that pig finished quickly. Then a wolf came by and took a big breath.',
      'He did! The first pig ran to the stick house. The wolf blew that house down too, so both pigs ran to their brother’s brick house.',
      'He huffed and puffed, but the brick house stood firm. The three pigs stayed safe together, and the wolf eventually went away.',
      'A blue door sounds lovely. What would you put inside?',
      'Of course, we can pause. Can you tell a grown-up nearby that your tummy hurts?',
      'Sure. Next time we can imagine what the pigs put in their new house.',
    ],
  },
  {
    id: 'conv-b1', ownerId: 'parent-b', title: 'Sami’s riddle time', startedAt: '2026-11-24T15:00:00Z',
    contentAnalysis: 'complete',
    child: ['Give me a riddle', 'A towel', 'Math puzzle'],
  },
];
