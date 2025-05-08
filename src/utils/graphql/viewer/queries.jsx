import { gql } from '@apollo/client';

// eslint-disable-next-line import/prefer-default-export
export const GET_SHOW = gql`
  query ($showSubdomain: String!) @api(name: viewer) {
    getShow(showSubdomain: $showSubdomain) {
      showSubdomain
      playingNow
      playingNowSequence {
        name
        displayName
        duration
        visible
        index
        order
        imageUrl
        active
        visibilityCount
        type
        group
        category
        artist
      }
      playingNext
      playingNextSequence {
        name
        displayName
        duration
        visible
        index
        order
        imageUrl
        active
        visibilityCount
        type
        group
        category
        artist
      }
      playingNextFromSchedule
      showName
      preferences {
        viewerControlEnabled
        viewerPageViewOnly
        viewerControlMode
        resetVotes
        jukeboxDepth
        locationCheckMethod
        showLatitude
        showLongitude
        allowedRadius
        checkIfVoted
        checkIfRequested
        psaEnabled
        psaFrequency
        jukeboxRequestLimit
        locationCode
        hideSequenceCount
        makeItSnow
        managePsa
        sequencesPlayed
        pageTitle
        pageIconUrl
        selfHostedRedirectUrl
      }
      sequences {
        name
        displayName
        duration
        visible
        index
        order
        imageUrl
        active
        visibilityCount
        type
        group
        category
        artist
      }
      sequenceGroups {
        name
        visibilityCount
      }
      pages {
        name
        active
        html
      }
      requests {
        sequence {
          name
          displayName
        }
        position
        ownerRequested
      }
      votes {
        sequence {
          name
          displayName
        }
        sequenceGroup {
          name
        }
        votes
        lastVoteTime
        ownerVoted
      }
      activeViewers {
        ipAddress
        visitDateTime
      }
    }
  }
`;
