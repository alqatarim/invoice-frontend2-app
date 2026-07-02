import AiReportsIndex from '@/views/aiReports';
import { getAiReportSuggestions } from './actions';

export default async function AiReportsPage() {
  let initialSuggestions = [];

  try {
    const response = await getAiReportSuggestions();
    initialSuggestions = Array.isArray(response?.suggestions) ? response.suggestions : [];
  } catch (error) {
    console.error('AI Reports suggestions prefetch failed:', error);
  }

  return <AiReportsIndex initialSuggestions={initialSuggestions} />;
}
