import { ptPT } from "@clerk/localizations";
import type { LocalizationResource } from "@clerk/types";

/**
 * Localização pt-PT com strings de reverificação preenchidas
 * (no pacote @clerk/localizations muitas vêm como undefined e caem para inglês).
 * Também cobre a mensagem de erro quando é necessária verificação adicional.
 */
const reverificationPtPT: LocalizationResource["reverification"] = {
  alternativeMethods: {
    actionLink: "Obter ajuda",
    actionText: "Não tem nenhum destes?",
    blockButton__backupCode: "Usar um código de backup",
    blockButton__emailCode: "Enviar código por email para {{identifier}}",
    blockButton__passkey: "Usar a sua chave de acesso",
    blockButton__password: "Continuar com a sua palavra-passe",
    blockButton__phoneCode: "Enviar código SMS para {{identifier}}",
    blockButton__totp: "Usar a sua aplicação de autenticação",
    getHelp: {
      blockButton__emailSupport: "Contactar apoio por email",
      content:
        "Se tiver dificuldades a verificar a sua conta, envie-nos um email e ajudaremos a restabelecer o acesso o mais rápido possível.",
      title: "Obter ajuda",
    },
    subtitle: "Com problemas? Pode usar qualquer um destes métodos para verificação.",
    title: "Usar outro método",
  },
  backupCodeMfa: {
    subtitle:
      "Introduza o código de backup que recebeu ao configurar a autenticação em duas etapas",
    title: "Introduzir um código de backup",
  },
  emailCode: {
    formTitle: "Código de verificação",
    resendButton: "Não recebeu o código? Reenviar",
    subtitle: "Introduza o código enviado para o seu email para continuar",
    title: "Verificação necessária",
  },
  noAvailableMethods: {
    message:
      "Não é possível prosseguir com a verificação. Nenhum método de autenticação adequado está configurado.",
    subtitle: "Ocorreu um erro",
    title: "Não é possível verificar a sua conta",
  },
  passkey: {
    blockButton__passkey: "Usar a sua chave de acesso",
    subtitle:
      "Usar a sua chave de acesso confirma a sua identidade. O dispositivo pode pedir impressão digital, face ou código de ecrã.",
    title: "Usar a sua chave de acesso",
  },
  password: {
    actionLink: "Usar outro método",
    subtitle: "Introduza a sua palavra-passe atual para continuar",
    title: "Verificação necessária",
  },
  phoneCode: {
    formTitle: "Código de verificação",
    resendButton: "Não recebeu o código? Reenviar",
    subtitle: "Introduza o código enviado para o seu telemóvel para continuar",
    title: "Verificação necessária",
  },
  phoneCodeMfa: {
    formTitle: "Código de verificação",
    resendButton: "Não recebeu o código? Reenviar",
    subtitle: "Introduza o código enviado para o seu telemóvel para continuar",
    title: "Verificação necessária",
  },
  totpMfa: {
    formTitle: "Código de verificação",
    subtitle:
      "Introduza o código gerado pela sua aplicação de autenticação para continuar",
    title: "Verificação necessária",
  },
};

export const clerkLocalizationPtPT: LocalizationResource = {
  ...ptPT,
  reverification: reverificationPtPT,
};
