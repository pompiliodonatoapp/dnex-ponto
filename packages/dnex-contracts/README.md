# DNEX Contracts

Contratos de dados de plataforma são pequenos, versionados, sem segredo e sem dados de tenant. `SolutionManifest` é emitido pelo control plane e validado pelo consumidor antes de alimentar o Shell V2.

O contrato não concede acesso. O control plane calcula entitlements e omite itens não autorizados; o produto revalida toda rota/API no servidor.
