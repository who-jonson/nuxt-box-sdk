export default lazyEventHandler(() => eventHandler(async () => {
  const users = useBoxUsersManager();
  // appendResponseHeader(event, 'Content-Type', 'application/json');
  return {
    user: await users.getUserMe()
    // token: await users.auth!.retrieveToken()
  };
}));
