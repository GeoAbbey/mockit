const hoistedIOLawyer = (io) => {
  return function lawyerLocation(payload) {
    console.log(`I was called with ${JSON.stringify(payload)} 🐥`);
  };
};

export { hoistedIOLawyer };
