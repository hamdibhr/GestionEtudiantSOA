using System.ServiceModel;

namespace BillingService.Services
{
    [ServiceContract]
    public interface IBillingService
    {
        [OperationContract]
        string ProcessPayment(string studentId, double amount, string currency);

        [OperationContract]
        double GetPendingBalance(string studentId);
    }
}
