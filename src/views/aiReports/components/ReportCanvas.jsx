'use client';

import Stack from '@mui/material/Stack';

import TextBlock from './blocks/TextBlock';
import KpiRowBlock from './blocks/KpiRowBlock';
import ChartBlock from './blocks/ChartBlock';
import TableBlock from './blocks/TableBlock';
import InsightBlock from './blocks/InsightBlock';

const BLOCK_RENDERERS = {
  text: TextBlock,
  kpis: KpiRowBlock,
  chart: ChartBlock,
  table: TableBlock,
  insight: InsightBlock,
};

const ReportCanvas = ({ blocks = [] }) => {
  if (!blocks.length) return null;

  return (
    <Stack spacing={2.5}>
      {blocks.map((block, index) => {
        const Renderer = BLOCK_RENDERERS[block.type];
        if (!Renderer) return null;

        if (block.type === 'text') {
          return <TextBlock key={`block-${index}`} content={block.content} />;
        }
        if (block.type === 'kpis') {
          return <KpiRowBlock key={`block-${index}`} items={block.items} />;
        }
        if (block.type === 'chart') {
          return <ChartBlock key={`block-${index}`} spec={block.spec} rows={block.rows} />;
        }
        if (block.type === 'table') {
          return (
            <TableBlock
              key={`block-${index}`}
              title={block.title}
              columns={block.columns}
              rows={block.rows}
            />
          );
        }
        if (block.type === 'insight') {
          return (
            <InsightBlock
              key={`block-${index}`}
              variant={block.variant}
              title={block.title}
              text={block.text}
            />
          );
        }

        return null;
      })}
    </Stack>
  );
};

export default ReportCanvas;
