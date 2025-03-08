export interface Scene {
    playerText: string;
    tessaText: string;
    pose: string;
    emotion?: string;
  }
  
  export const introSequence: Scene[] = [
    {
      playerText: "Hello, is your mom or dad home?",
      tessaText: "Nope, just me! I'm in charge today.",
      pose: "/images/characters/tessa/pose1.png",
      emotion: "confident"
    },
    {
      playerText: "I see, well I came to talk to them.",
      tessaText: "They're not around much, but they'll be back soon. You can talk to me until then.",
      pose: "/images/characters/tessa/pose2.png",
      emotion: "confident"
    },
    {
      playerText: "Are you all alone here?",
      tessaText: "I'm not scared. I'm used to it.",
      pose: "/images/characters/tessa/pose3.png",
      emotion: "defensive"
    },
    {
      playerText: "While I wait, you can tell me what you like to do around here.",
      tessaText: "I'm really good at sneaking around the house to avoid my mom when she's in one of her moods... but it gets lonely sometimes.",
      pose: "/images/characters/tessa/pose4.png",
      emotion: "lonely"
    }
  ];