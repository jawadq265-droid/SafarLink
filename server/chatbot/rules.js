export function getRuleReply(message) {
  const msg = message.toLowerCase();

  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
    return "Hi. How may I help you?";
  }

  if (msg.includes("contact")) {
    return "SafarLink Contact\nwww.SafarLink.com\nsufarlink0@gmail.com\n+92 3090996833";
  }

   if (msg.includes("owner")) {
    return "SafarLink founded in 2025.\nIts a Team Project of NCBA Students.";
  }

  if (msg.includes("service")) {
    return "SafarLink Service:\n Providing you the comfort in Travelling";
  }

  if (msg.includes("cities")) {
  return "SafarLink\n Providing the services around the pakistan so we almost cover all the cities.";
}
if (msg.includes("book")) {
  return "You can Sign In and pay to get your seats reserved. Be quick before it gets late!";
}
 if (msg.includes("ok")) {
  return "I hope you find the answers of your questions. Thanks";
}

 return "Ask me anything about SafarLink, I can only provide you the answers about SafarLink.";

}