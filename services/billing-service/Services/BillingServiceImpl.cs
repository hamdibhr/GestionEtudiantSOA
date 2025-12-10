using System.Collections.Concurrent;

namespace BillingService.Services
{
    public class BillingServiceImpl : IBillingService
    {
        // Mock Database
        private static ConcurrentDictionary<string, double> _balances = new();

        public string ProcessPayment(string studentId, double amount, string currency)
        {
            if (!_balances.ContainsKey(studentId))
            {
                _balances[studentId] = 1000.00; // Default pending balance
            }

            _balances[studentId] -= amount;
            return $"Payment of {amount} {currency} success. New Balance: {_balances[studentId]}";
        }

        public double GetPendingBalance(string studentId)
        {
            return _balances.ContainsKey(studentId) ? _balances[studentId] : 1000.00;
        }
    }
}
