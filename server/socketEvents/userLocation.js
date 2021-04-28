const hoistedIOUser = (io) => {
  return function userLocation(payload) {
    console.log(`I ahve received this payload ${payload} 🐥`);
    io.emit("lawyer:location:server", { name: "in the power of the king 🍅" });
  };
};

export { hoistedIOUser };
