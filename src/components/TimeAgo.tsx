import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimeAgoProps {
  date: string;
  className?: string;
}

const TimeAgo = ({ date, className = "" }: TimeAgoProps) => {
  const timeAgo = formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <time dateTime={date} className={`text-news-muted ${className}`}>
      {timeAgo}
    </time>
  );
};

export default TimeAgo;
