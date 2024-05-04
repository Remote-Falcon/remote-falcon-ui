import { gql } from '@apollo/client';

export const INSERT_VIEWER_PAGE_STATS = gql`
  mutation ($date: String!) {
    insertViewerPageStats(date: $date)
  }
`;

export const UPDATE_ACTIVE_VIEWERS = gql`
  mutation {
    updateActiveViewers
  }
`;

export const ADD_SEQUENCE_TO_QUEUE = gql`
  mutation ($name: String!, $latitude: Float, $longitude: Float) {
    addSequenceToQueue(name: $name, latitude: $latitude, longitude: $longitude)
  }
`;

export const VOTE_FOR_SEQUENCE = gql`
  mutation ($name: String!, $latitude: Float, $longitude: Float) {
    voteForSequence(name: $name, latitude: $latitude, longitude: $longitude)
  }
`;
