export interface ChoiceScene {
    id: string;
    tessaText: string;
    pose: string;
    choices?: {
      id: string;
      text: string;
      type: 'A' | 'B' | 'C';
      nextSceneId: string;
    }[];
    isEnding?: boolean;
  }
  
  export const choiceScenes: { [key: string]: ChoiceScene } = {
    // First Choice
    firstChoice: {
      id: 'firstChoice',
      tessaText: "So, what do you usually talk about with my parents?",
      pose: "/images/characters/tessa/choice1.png",
      choices: [
        {
          id: '1A',
          text: "You talk a lot, don't you?",
          type: 'A',
          nextSceneId: 'reaction1A'
        },
        {
          id: '1B',
          text: "We usually talk about different things. You seem really curious, though!",
          type: 'B',
          nextSceneId: 'reaction1B'
        },
        {
          id: '1C',
          text: "We mostly talk about normal things. Do you not get to talk with them much?",
          type: 'C',
          nextSceneId: 'reaction1C'
        }
      ]
    },
  
    // First Reactions
    reaction1A: {
      id: 'reaction1A',
      tessaText: "I don’t really get to talk to them about stuff. They’re too busy.",
      pose: "/images/characters/tessa/reaction1A.png",
      choices: [
        {
          id: '2A',
          text: "It happens. It's not a big deal.",
          type: 'A',
          nextSceneId: 'reaction2A'
        },
        {
          id: '2B',
          text: "You seem pretty brave to be here alone.",
          type: 'B',
          nextSceneId: 'reaction2B'
        },
        {
          id: '2C',
          text: "You don't have to explain it to me if you don't want to.",
          type: 'C',
          nextSceneId: 'reaction2C'
        }
      ]
    },
    reaction1B: {
      id: 'reaction1B',
      tessaText: "I just get bored sometimes. They’re always working, you know?",
      pose: "/images/characters/tessa/reaction1B.png",
      choices: [
        {
          id: '2A',
          text: "It happens. It's not a big deal.",
          type: 'A',
          nextSceneId: 'reaction2A'
        },
        {
          id: '2B',
          text: "You seem pretty brave to be here alone.",
          type: 'B',
          nextSceneId: 'reaction2B'
        },
        {
          id: '2C',
          text: "You don't have to explain it to me if you don't want to.",
          type: 'C',
          nextSceneId: 'reaction2C'
        }
      ]
    },
    reaction1C: {
      id: 'reaction1C',
      tessaText: "I guess I just spend a lot of time by myself. That’s fine, I guess.",
      pose: "/images/characters/tessa/reaction1C.png",
      choices: [
        {
          id: '2A',
          text: "It happens. It's not a big deal.",
          type: 'A',
          nextSceneId: 'reaction2A'
        },
        {
          id: '2B',
          text: "You seem pretty brave to be here alone.",
          type: 'B',
          nextSceneId: 'reaction2B'
        },
        {
          id: '2C',
          text: "You don't have to explain it to me if you don't want to.",
          type: 'C',
          nextSceneId: 'reaction2C'
        }
      ]
    },
  
    // Second Reactions
    reaction2A: {
      id: 'reaction2A',
      tessaText: "I don’t know... I feel like even if I talked to them, they wouldn’t care.",
      pose: "/images/characters/tessa/reaction2A.png",
      choices: [
        {
          id: '3A',
          text: "It can't be that hard to be by yourself sometimes.",
          type: 'A',
          nextSceneId: 'ending'
        },
        {
          id: '3B',
          text: "Maybe it would help to talk to your parents about how you feel.",
          type: 'B',
          nextSceneId: 'ending'
        },
        {
          id: '3C',
          text: "You seem really strong, but even strong people need help sometimes.",
          type: 'C',
          nextSceneId: 'ending'
        }
      ]
    },
    reaction2B: {
      id: 'reaction2B',
      tessaText: "Sometimes I wonder if they even notice I’m here.",
      pose: "/images/characters/tessa/reaction2B.png",
      choices: [
        {
          id: '3A',
          text: "It can't be that hard to be by yourself sometimes.",
          type: 'A',
          nextSceneId: 'ending'
        },
        {
          id: '3B',
          text: "Maybe it would help to talk to your parents about how you feel.",
          type: 'B',
          nextSceneId: 'ending'
        },
        {
          id: '3C',
          text: "You seem really strong, but even strong people need help sometimes.",
          type: 'C',
          nextSceneId: 'ending'
        }
      ]
    },
    reaction2C: {
      id: 'reaction2C',
      tessaText: "I try not to let it bother me, but it’s hard.",
      pose: "/images/characters/tessa/reaction2C.png",
      choices: [
        {
          id: '3A',
          text: "It can't be that hard to be by yourself sometimes.",
          type: 'A',
          nextSceneId: 'ending'
        },
        {
          id: '3B',
          text: "Maybe it would help to talk to your parents about how you feel.",
          type: 'B',
          nextSceneId: 'ending'
        },
        {
          id: '3C',
          text: "You seem really strong, but even strong people need help sometimes.",
          type: 'C',
          nextSceneId: 'ending'
        }
      ]
    },
  
    // Ending Scene
    ending: {
      id: 'ending',
      tessaText: "", // Will be dynamically set
      pose: "/images/characters/tessa/ending.png",
      isEnding: true
    }
  };