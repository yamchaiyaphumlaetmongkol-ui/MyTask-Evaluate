type Props = {
  message: string;
  filtered?: boolean;
};

/** ข้อความไม่มีข้อมูล — กึ่งกลาง muted */
export function ErpEmptyState({ message, filtered }: Props) {
  return (
    <p className="text-muted text-center py-4 mb-0">
      {filtered ? message : message}
    </p>
  );
}
