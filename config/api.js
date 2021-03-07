module.exports = ({ env }) => ({
  /*responses: {
      privateAttributes: ['_v', 'id', 'created_at'],
    },*/
  rest: {
    defaultLimit: 20000,
    maxLimit: null,
  },
});
