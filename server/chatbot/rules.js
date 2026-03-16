export function getRuleReply(message) {
  const msg = message.toLowerCase();

  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
    return "Hi. How may I help you?";
  }

  if (msg.includes("contact")) {
    return "SafarLink Contact\nwww.SafarLink.com\ninfo@SafarLink.com\n+92 3090996833";
  }

   if (msg.includes("owner")) {
    return "SafarLink founded in 2025.\nIts a Team Project of NCBA Students.";
  }

  if (msg.includes("service")) {
    return "SafarLink Services:\n Providing you the comfort in Travelling";
  }

  if (msg.includes("cities")) {
  return "SafarLink\n Providing the services around the pakistan so we almost cover all the cities.";
}

 return "Ask me anything about SafarLink, I can only provide you the answers about SafarLink.";

}