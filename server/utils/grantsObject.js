export const grantsObject = {
  superAdmin: {
    User: {
      "create:any": ["*"],
      "read:any": ["*"],
      "update:any": ["*"],
      "delete:any": ["*"],
    },
  },
  admin: {
    User: {
      "create:any": ["*"],
      "update:any": ["*", "!role"],
      "read:any": ["*"],
      "delete:any": ["*"],
    },
  },
  lawyer: {
    User: {
      "update:own": ["*", "!role"],
      "read:own": ["*"],
      "delete:own": ["*"],
    },
  },
  user: {
    User: {
      "update:own": ["*", "!role"],
      "read:own": ["*"],
      "delete:own": ["*"],
    },
  },
};
