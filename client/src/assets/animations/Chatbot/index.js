import idle from "./idle.json";
import greeting from "./greeting.json";
import thinking from "./thinking.json";
import success from "./success.json";
import error from "./error.json";
import notification from "./notification.json";

export const chatbotAnimations = {
  idle,
  greeting,
  thinking,
  success,
  happy: success, // Alias as per mascot states
  error,
  notification,
};

export { idle, greeting, thinking, success, error, notification };

