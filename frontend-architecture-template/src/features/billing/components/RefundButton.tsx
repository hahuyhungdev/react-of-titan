// RefundButton — wrap Button (components/ui) + thêm nghiệp vụ (Scenario 2).
import { Button } from "@/shared/components/ui/button/Button";
import { useRefund } from "../hooks/useRefund";

export function RefundButton({ invoiceId }: { invoiceId: string }) {
  const refund = useRefund();

  return (
    <Button
      variant="danger"
      isLoading={refund.isPending}
      onClick={() => {
        if (window.confirm("Xác nhận hoàn tiền?")) refund.mutate(invoiceId);
      }}
    >
      Hoàn tiền
    </Button>
  );
}
