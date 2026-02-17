import { ForwardInterface } from "@/components/forms/swap";
import { AppLayout, CardWrapper, ContentLayout } from "@/components/layout/page-shell";

export default function AppPage() {
  return (
    <AppLayout>
      <ContentLayout variant="rfq">
        <CardWrapper size="ticket">
          <ForwardInterface />
        </CardWrapper>
      </ContentLayout>
    </AppLayout>
  );
}
