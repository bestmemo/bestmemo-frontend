import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Card = styled.div`
  position: absolute;
  left: 50vw;
  top: 50vh;
  width: 500px;
  height: 500px;
  box-shadow: 0 3px 10px rgba(0,0,0,.2);
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, .15);
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  // align-items: center;
  justify-content: space-between;
`

const BackSide = styled.div`
  scrollbar-width: none;
  height: 100%;
  align-self: center;
  justify-self: center;
  overflow-y: scroll;
  padding: 1rem 1rem;
`

const FrontSide = styled.div`
  align-self: center;
  justify-self: center;
  font-size: 36px;
`

const Empty = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #b2b2b2;
`

const Summary = styled.div`
  background: #f2f2f2;
  display: grid;
  grid-auto-flow: column;
  padding: .5em .5em;
  gap: .5em;
  border-bottom: 1px solid rgba(0,0,0,.1);
`

const SummaryCell = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const Actions = styled.div`
  background: #f2f2f2;
  display: grid;
  grid-auto-flow: column;
  padding: .5em .5em;
  gap: .5em;
  border-top: 1px solid rgba(0,0,0,.1);
`

const Button = styled.button`
  border: 1px solid rgba(0,0,0,.1);
  border-radius: 3px;
  box-shadow: 0 1px 2px 0 rgba(25,25,25,.16);
  display: inline-block;
  background: #ffffff;
  overflow: hidden;
  position: relative;
  transition: all .1s linear;
  font-size: 18px;
  color: #000000;
  &:hover {
    color: #ffffff;
    border-color: #0057ff;
    background: #0057ff;
  }
`

type Review = 'easy' | 'good' | 'hard' | 'again' | null;

interface Summary {
  readonly due: number;
  readonly later: number;
  readonly learning: number;
  readonly overdue: number;
}

interface Card {
  readonly front: string;
  readonly back: string;
}

interface ServerResponse {
  readonly currentCard: Card;
  readonly summary: Summary;
}

const App: React.FC = () => {
  const [current, setCurrent] = useState<Card | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [review, setReview] = useState<Review | null>(null);

  const updateContent = (promise: Promise<Response>) => {
    promise
      .then(response => response.json())
      .then((response: ServerResponse) => {
        setCurrent(response.currentCard);
        setSummary(response.summary);
        setReview(null);
      })
      .catch(() => {
        setCurrent(null);
      });
  };

  const sendReview = () => {
    if (review === null) {
      return;
    }
    updateContent(fetch(`/${review}`, { method: 'POST' }));
  };

  useEffect(() => {
    updateContent(fetch('/current'));
  }, []);

  const actions = current === null ? (
    <Actions />
  ) : (
    review === null ? (
      <Actions>
        <Button onClick={() => setReview('easy')}>轻松</Button>
        <Button onClick={() => setReview('good')}>犹豫</Button>
        <Button onClick={() => setReview('hard')}>困难</Button>
        <Button onClick={() => setReview('again')}>忘记</Button>
      </Actions>
    ) : (
      <Actions>
        {(review === 'easy' || review === 'good') && <Button onClick={sendReview}>下一个</Button>}
        <Button onClick={() => setReview(null)}>撤回</Button>
        {(review === 'hard' || review === 'again') && <Button onClick={sendReview}>下一个</Button>}
      </Actions>
    )
  )

  const content = current === null ? (
    <Empty>今天没有单词需要复习了</Empty>
  ) : (
    review === null ? (
      <FrontSide>{current.front}</FrontSide>
    ) : (
      <BackSide dangerouslySetInnerHTML={{ __html: current.back }} />
    )
  )

  return (
    <Card>
      <Summary>
        <SummaryCell>快到期: {summary ? summary.due : ''}</SummaryCell>
        <SummaryCell>稍后复习: {summary ? summary.later : ''}</SummaryCell>
        <SummaryCell>正在学习: {summary ? summary.learning : ''}</SummaryCell>
        <SummaryCell>已遗忘: {summary ? summary.overdue : ''}</SummaryCell>
      </Summary>
      {content}
      {actions}
    </Card>
  );
}

export default App;
