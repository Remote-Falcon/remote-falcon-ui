### Style Element
```
#interactionStatusBanner {
  position: sticky;
  top: 0;
  z-index: 10;
  margin: 12px auto;
  max-width: 90%;
  padding: 12px 16px;
  background: rgba(142, 59, 46, 0.9);
  color: #FFF2EE;
  border: 1px solid #A9574C;
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
}
#interactionStatusBanner > div {
  font-size: 1rem !important;
}
```

### DIV Container
```
<div id="interactionStatusBanner">
  <div id="readOnlyRequestsDisabled" style="display: none;">Requests are off right now.</div>
  <div id="readOnlyVotesDisabled" style="display: none;">Voting is paused.</div>
  <div id="readOnlyLocationCodeRequired" style="display: none;">Enter your code to continue.</div>
  <div id="readOnlyInvalidLocationCode" style="display: none;">That code doesn't match.</div>
  <div id="readOnlyQueueFull" style="display: none;">Queue is full — try again soon.</div>
  <div id="readOnlyAlreadyVoted" style="display: none;">You already voted.</div>
  <div id="readOnlyAlreadyRequested" style="display: none;">You already requested.</div>
  <div id="readOnlyInvalidLocation" style="display: none;">You're outside the allowed area.</div>
</div>
```