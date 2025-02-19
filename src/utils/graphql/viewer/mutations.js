import { gql } from '@apollo/client';

export const INSERT_VIEWER_PAGE_STATS = gql`
  mutation ($showSubdomain: String!, $date: DateTime!) @api(name: viewer) {
    insertViewerPageStats(showSubdomain: $showSubdomain, date: $date)
  }
`;

export const UPDATE_ACTIVE_VIEWERS = gql`
  mutation ($showSubdomain: String!) @api(name: viewer) {
    updateActiveViewers(showSubdomain: $showSubdomain)
  }
`;

export const ADD_SEQUENCE_TO_QUEUE = gql`
  mutation ($showSubdomain: String!, $name: String!, $latitude: Float, $longitude: Float) @api(name: viewer) {
    addSequenceToQueue(showSubdomain: $showSubdomain, name: $name, latitude: $latitude, longitude: $longitude)
  }
`;

export const VOTE_FOR_SEQUENCE = gql`
  mutation ($showSubdomain: String!, $name: String!, $latitude: Float, $longitude: Float) @api(name: viewer) {
    voteForSequence(showSubdomain: $showSubdomain, name: $name, latitude: $latitude, longitude: $longitude)
  }
`;
