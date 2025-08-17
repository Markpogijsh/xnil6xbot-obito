module.exports = {
  config: {
    name: "hiEvent",
    version: "1.0.0",
    author: "keijo",
    role: 0,
    description: "Auto-reply greetings when someone says hi",
    hasPrefix: false,
    event: true
  },

  onStart: async function ({ message, event }) {
    // Dummy onStart para sa GoatBot install
    return;
  },

  onChat: async function ({ event, message }) {
    if (!event.body) return;

    const text = event.body.toLowerCase();

    const greetings = [
      "hi","hello","hey","yo","hiya","sup",
      "good morning","good afternoon","good evening",
      "howdy","greetings","hola","bonjour","ola",
      "hey there","hi there","wassup","heyyo","hiyaa"
    ];

    const responses = [
      "Hello!", "Hi there!", "Hey! How's it going?", "Yo!",
      "Hi! Nice to see you!", "Hello, friend!", "Hey hey!",
      "Hiya! How are you?", "Greetings!", "Howdy partner!",
      "Hey! What's up?", "Hello! Hope you're doing great!",
      "Hi! Long time no see!", "Hey! Good to see you!",
      "Yo! How’s everything?", "Hi! Stay awesome!", "Hello there!",
      "Hey! Ready for today?", "Hi! Sending positive vibes!",
      "Yo! Keep smiling!", "Hey! Let's have a good day!",
      "Hi! How’s your mood today?", "Hello! Wishing you happiness!",
      "Hey! Have a fantastic day!", "Hi there! Hope all is well!",
      "Yo! Feeling good?", "Hello! What’s new with you?",
      "Hey! Let’s make today awesome!", "Hi! Smile, it’s a beautiful day!",
      "Greetings! Ready for some fun?", "Hey! Hope you’re having a great time!",
      "Hi! Sending you positive energy!", "Yo! Don’t forget to stay hydrated!",
      "Hello! Keep shining bright!", "Hey! What’s happening today?",
      "Hi! Hope your day is going well!", "Hello! Keep up the good vibes!",
      "Hey hey! What’s cooking?", "Hi! Time to spread some joy!",
      "Yo! Keep rocking!", "Hello! How’s everything going?",
      "Hey! Have a fun-filled day!", "Hi! Wishing you smiles all around!",
      "Hey! Hope your day is productive!", "Hi! Sending you good thoughts!",
      "Hello! Ready to conquer the day?", "Yo! Stay positive and happy!",
      "Hi! Enjoy every moment today!", "Hey! Keep your spirits high!"
    ];

    const matched = greetings.some(greet => text.includes(greet));
    if (matched) {
      const reply = responses[Math.floor(Math.random() * responses.length)];
      await message.reply(reply);
    }
  }
};