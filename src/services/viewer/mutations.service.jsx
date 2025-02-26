export const addSequenceToQueueService = (addSequenceToQueueMutation, showSubdomain, name, viewerLatitude, viewerLongitude, callback) => {
  addSequenceToQueueMutation({
    context: {
      headers: {
        Route: 'Viewer'
      }
    },
    variables: {
      showSubdomain,
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

export const voteForSequenceService = (voteForSequenceMutation, showSubdomain, name, viewerLatitude, viewerLongitude, callback) => {
  voteForSequenceMutation({
    context: {
      headers: {
        Route: 'Viewer'
      }
    },
    variables: {
      showSubdomain,
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
