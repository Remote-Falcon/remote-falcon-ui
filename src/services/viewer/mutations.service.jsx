export const addSequenceToQueueService = (addSequenceToQueueMutation, showSubdomain, name, callback) => {
  addSequenceToQueueMutation({
    context: {
      headers: {
        Route: 'Viewer'
      }
    },
    variables: {
      showSubdomain,
      name
    },
    onCompleted: (response) => {
      callback({
        success: true,
        response
      });
    },
    onError: (error) => {
      callback({
        success: false,
        error
      });
    }
  });
};

export const voteForSequenceService = (voteForSequenceMutation, showSubdomain, name, callback) => {
  voteForSequenceMutation({
    context: {
      headers: {
        Route: 'Viewer'
      }
    },
    variables: {
      showSubdomain,
      name
    },
    onCompleted: (response) => {
      callback({
        success: true,
        response
      });
    },
    onError: (error) => {
      callback({
        success: false,
        error
      });
    }
  });
};
