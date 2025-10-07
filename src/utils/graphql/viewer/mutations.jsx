import { gql } from '@apollo/client';

export const INSERT_VIEWER_PAGE_STATS = gql`
  mutation InsertViewerPageStats($showSubdomain: String!, $date: DateTime!) @api(name: viewer) {
    insertViewerPageStats(showSubdomain: $showSubdomain, date: $date)
  }
`;

export const UPDATE_ACTIVE_VIEWERS = gql`
  mutation UpdateActiveViewers($showSubdomain: String!) @api(name: viewer) {
    updateActiveViewers(showSubdomain: $showSubdomain)
  }
`;

export const ADD_SEQUENCE_TO_QUEUE = gql`
  mutation AddSequenceToQueue($showSubdomain: String!, $name: String!, $latitude: Float, $longitude: Float) @api(name: viewer) {
    addSequenceToQueue(showSubdomain: $showSubdomain, name: $name, latitude: $latitude, longitude: $longitude)
  }
`;

export const VOTE_FOR_SEQUENCE = gql`
  mutation VoteForSequence($showSubdomain: String!, $name: String!, $latitude: Float, $longitude: Float) @api(name: viewer) {
    voteForSequence(showSubdomain: $showSubdomain, name: $name, latitude: $latitude, longitude: $longitude)
  }
`;
