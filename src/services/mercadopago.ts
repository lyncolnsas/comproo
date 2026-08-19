import { MercadoPagoConfig, Payment } from 'mercadopago';

export class MercadoPagoService {
  private client: MercadoPagoConfig;

  constructor(accessToken: string) {
    this.client = new MercadoPagoConfig({ accessToken });
  }

  static async init(accessToken: string) {
    return new MercadoPagoService(accessToken);
  }

  async createPixPayment(data: {
    transaction_amount: number;
    description: string;
    payer: {
      email: string;
      first_name?: string;
      identification?: { type: string; number: string };
    };
  }) {
    const payment = new Payment(this.client);
    
    try {
      const result = await payment.create({
        body: {
          transaction_amount: data.transaction_amount,
          description: data.description,
          payment_method_id: 'pix',
          payer: {
            email: data.payer.email,
            first_name: data.payer.first_name,
            identification: data.payer.identification,
          },
        }
      });
      return result;
    } catch (error) {
      console.error('Error creating PIX:', error);
      throw error;
    }
  }
}
