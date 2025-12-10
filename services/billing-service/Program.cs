using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SoapCore;
using BillingService.Services; // Ensure this matches your folder structure

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSoapCore();
builder.Services.AddSingleton<IBillingService, BillingServiceImpl>();

var app = builder.Build();

app.UseRouting();

app.UseEndpoints(endpoints =>
{
    // The Fix: Use 'endpoints' here, NOT 'app'
    endpoints.UseSoapEndpoint<IBillingService>("/billing.asmx", new SoapEncoderOptions(), SoapSerializer.XmlSerializer);
});

app.Run();