export interface Booking {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  packageName: string;
  tourDate: string;
  tourTime: string;
  paxCount: number;
  jeepCount: number;
  totalAmount: number;
  dpAmount: number;
  remainingAmount: number;
  paymentMethod: string;
  paymentStatus: 'DP_DITERIMA' | 'LUNAS' | 'MENUNGGU_PEMBAYARAN';
  approvalStatus: 'APPROVED' | 'PENDING' | 'CANCELLED';
  driverName?: string;
  jeepNumber?: string;
  notes?: string;
  createdAt: string;
  approvedAt?: string;
}

export type CreateBookingInput = Omit<Booking, 'id' | 'bookingCode' | 'remainingAmount' | 'createdAt'>;
