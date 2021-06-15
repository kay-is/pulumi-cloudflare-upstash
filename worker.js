addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  switch (request.method) {
    case "POST":
      return createPost(request.body);
    case "DELETE": {
      const postKey = request.url.split("/").pop();
      return removePost(postKey);
    }
    case "GET":
      return listPosts();
    default:
      return new Response("Not found", { status: 404 });
  }
}

async function createPost(text) {
  const id = await callRestApi("incr", "post:id");
  const postKey = `post:${id}`;
  await callRestApi("set", postKey, text);
  await callRestApi("sadd", "posts", postKey);
  return new Response(postKey, { status: 201 });
}

async function listPosts() {
  const postKeys = await callRestApi("smembers", "posts");
  const posts = await callRestApi("mget", postKeys);
  return new Response(
    JSON.stringify(posts.map((text, i) => ({ id: postKeys[i], text })))
  );
}

async function removePost(postKey) {
  await callRestApi("srem", "posts", postKey);
  await callRestApi("del", postKey);
  return new Response(postKey);
}

async function callRestApi(command, ...args) {
  args = Array.isArray(args[0]) ? args[0] : args;
  const response = await fetch(
    `${DB_URL}/${command}/${args.join("/")}?_token=${DB_TOKEN}`
  );
  const data = await response.json();
  return data.result;
}
