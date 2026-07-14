type ReceivedQuestionLike = {
  questionSendId?: number;
  receivedAt: string;
  answered?: boolean;
  status?: string;
};

function isPendingQuestion(question: ReceivedQuestionLike) {
  return question.answered !== true && question.status !== "answered" && question.status !== "cancelled" && question.status !== "expired";
}

function getReceivedTime(question: ReceivedQuestionLike) {
  const time = new Date(question.receivedAt).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

export function sortReceivedQuestionsForAnswering<T extends ReceivedQuestionLike>(questions: T[]) {
  return [...questions].sort((a, b) => {
    const pendingDelta = Number(isPendingQuestion(b)) - Number(isPendingQuestion(a));
    if (pendingDelta !== 0) return pendingDelta;

    const timeDelta = getReceivedTime(a) - getReceivedTime(b);
    if (timeDelta !== 0) return timeDelta;

    return (a.questionSendId ?? 0) - (b.questionSendId ?? 0);
  });
}
