import React from 'react';
import styled from '@emotion/styled';

const CenteredContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    gap: 2rem; // Adds space between the heading and the GIF
`;

const StyledHeading = styled.h1`
  margin: 0; // Removes default margin to ensure proper centering
  text-align: center;
`;


const NotFound = () => {
  return (
    <CenteredContainer>
      <StyledHeading>It looks like you&apos;re lost...</StyledHeading>
      <img
        src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNngwcTdrdG9zcmt6eHQ2eHR0cDRmYnM1bXY4ZjFkYTVveWVtbHlkeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aTskHEUdgCQAXde/giphy.gif"
        alt="Confused John Travolta GIF"
      />
    </CenteredContainer>
  );
};

export default NotFound;