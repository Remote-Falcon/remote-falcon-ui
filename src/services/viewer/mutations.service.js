export const addSequenceToQueueService = (addSequenceToQueueMutation, name, viewerLatitude, viewerLongitude, callback) => {
  addSequenceToQueueMutation({
    context: {
      headers: {
        Route: 'Viewer'
      }
    },
    variables: {
      name,
      latitude: parseFloat(viewerLatitude),
      longitude: parseFloat(viewerLongitude)
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

export const voteForSequenceService = (voteForSequenceMutation, name, viewerLatitude, viewerLongitude, callback) => {
  voteForSequenceMutation({
    context: {
      headers: {
        Route: 'Viewer'
      }
    },
    variables: {
      name,
      latitude: parseFloat(viewerLatitude),
      longitude: parseFloat(viewerLongitude)
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
