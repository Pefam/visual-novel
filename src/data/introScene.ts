export interface Scene {
  playerText: string;
  tessaText: string;
  scene: string;
  emotion?: string;
}

export const introSequence: Scene[] = [
  {
    playerText: "Hello, is your mom or dad home?",
    tessaText: "Nope, just me! I'm in charge today.",
    scene: "/images/scenes/scene1.png",
    emotion: "confident"
  },
  {
    playerText: "I see, well I came to talk to them.",
    tessaText: "They're not around much, but they'll be back soon. You can talk to me until then.",
    scene: "/images/scenes/scene2.png",
    emotion: "confident"
  },
  {
    playerText: "Are you all alone here?",
    tessaText: "I'm not scared. I'm used to it.",
    scene: "/images/scenes/scene3.png",
    emotion: "defensive"
  },
  {
    playerText: "While I wait, you can tell me what you like to do around here.",
    tessaText: "I'm really good at sneaking around the house to avoid my mom when she's in one of her moods... but it gets lonely sometimes.",
    scene: "/images/scenes/scene4.png",
    emotion: "lonely"
  }
];