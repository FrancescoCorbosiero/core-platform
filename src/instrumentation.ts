export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node')
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http')
    const { SentrySpanProcessor } = await import('@sentry/opentelemetry')

    const sdk = new NodeSDK({
      traceExporter: new OTLPTraceExporter(),
      spanProcessors: [new SentrySpanProcessor()],
      serviceName: process.env.OTEL_SERVICE_NAME || 'tereso',
    })

    sdk.start()
  }
}
