"use client";

import {
  AlertTriangle,
  KeyRound,
  Mail,
  Trash2,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  getSupabaseBrowserClient
} from "@/lib/supabase/browser";
import {
  useSiteLanguage,
  type LanguageCode
} from "@/lib/site-language";

type Mode = "email" | "password" | "delete" | null;

type Copy = {
  accountActions: string;
  changeEmail: string;
  changeEmailHelp: string;
  currentPassword: string;
  newEmail: string;
  sendEmailChange: string;
  emailChangeSent: string;
  emailChangeFailed: string;
  wrongPassword: string;
  changePassword: string;
  changePasswordHelp: string;
  accountEmail: string;
  sendReset: string;
  resetSent: string;
  resetFailed: string;
  emailMismatch: string;
  deleteAccount: string;
  deleteHelp: string;
  deleteTitle: string;
  permanentWarning: string;
  deleteEverything: string;
  understandPermanent: string;
  confirmDelete: string;
  deleteFailed: string;
  cancel: string;
  working: string;
  close: string;
};

const COPY: Record<LanguageCode, Copy> = {
  EN: {
    accountActions: "Account actions",
    changeEmail: "Change email",
    changeEmailHelp:
      "Enter your current password. Verification links will be sent before the new email becomes active.",
    currentPassword: "Current password",
    newEmail: "New email",
    sendEmailChange: "Send verification links",
    emailChangeSent:
      "Verification email sent. Follow the link before using the new address.",
    emailChangeFailed: "The email change could not be started.",
    wrongPassword: "The current password is incorrect.",
    changePassword: "Change password",
    changePasswordHelp:
      "Enter the email currently connected to this account. A secure password-reset link will be sent.",
    accountEmail: "Account email",
    sendReset: "Send password-reset email",
    resetSent:
      "Password-reset email sent. Open its link to choose a new password.",
    resetFailed: "The password-reset email could not be sent.",
    emailMismatch:
      "Enter the email currently connected to this account.",
    deleteAccount: "Delete account",
    deleteHelp:
      "Permanently delete this account and everything associated with it.",
    deleteTitle: "Permanently delete account?",
    permanentWarning:
      "This cannot be undone. Your companions, chats, memories, favorites, gifts, balances, purchases, profile, and account access will be deleted and cannot be recovered.",
    deleteEverything:
      "Delete everything associated with my account.",
    understandPermanent:
      "I understand this deletion is permanent.",
    confirmDelete: "Permanently delete account",
    deleteFailed: "The account could not be deleted.",
    cancel: "Cancel",
    working: "One moment...",
    close: "Close"
  },
  ES: {
    accountActions: "Acciones de la cuenta",
    changeEmail: "Cambiar correo",
    changeEmailHelp:
      "Introduce tu contraseña actual. Se enviarán enlaces de verificación antes de activar el nuevo correo.",
    currentPassword: "Contraseña actual",
    newEmail: "Nuevo correo",
    sendEmailChange: "Enviar enlaces de verificación",
    emailChangeSent:
      "Correo de verificación enviado. Abre el enlace antes de usar la nueva dirección.",
    emailChangeFailed: "No se pudo iniciar el cambio de correo.",
    wrongPassword: "La contraseña actual es incorrecta.",
    changePassword: "Cambiar contraseña",
    changePasswordHelp:
      "Introduce el correo conectado actualmente a esta cuenta. Se enviará un enlace seguro.",
    accountEmail: "Correo de la cuenta",
    sendReset: "Enviar correo para restablecer",
    resetSent:
      "Correo enviado. Abre el enlace para elegir una nueva contraseña.",
    resetFailed: "No se pudo enviar el correo de restablecimiento.",
    emailMismatch: "Introduce el correo conectado a esta cuenta.",
    deleteAccount: "Eliminar cuenta",
    deleteHelp:
      "Elimina permanentemente esta cuenta y todo lo asociado.",
    deleteTitle: "¿Eliminar la cuenta permanentemente?",
    permanentWarning:
      "Esto no se puede deshacer. Se eliminarán tus compañeros, chats, recuerdos, favoritos, regalos, saldos, compras, perfil y acceso, y no podrán recuperarse.",
    deleteEverything: "Eliminar todo lo asociado con mi cuenta.",
    understandPermanent:
      "Entiendo que esta eliminación es permanente.",
    confirmDelete: "Eliminar cuenta permanentemente",
    deleteFailed: "No se pudo eliminar la cuenta.",
    cancel: "Cancelar",
    working: "Un momento...",
    close: "Cerrar"
  },
  FR: {
    accountActions: "Actions du compte",
    changeEmail: "Changer l’e-mail",
    changeEmailHelp:
      "Saisissez votre mot de passe actuel. Des liens de vérification seront envoyés avant l’activation.",
    currentPassword: "Mot de passe actuel",
    newEmail: "Nouvel e-mail",
    sendEmailChange: "Envoyer les liens de vérification",
    emailChangeSent:
      "E-mail de vérification envoyé. Ouvrez le lien avant d’utiliser la nouvelle adresse.",
    emailChangeFailed: "Le changement d’e-mail n’a pas pu démarrer.",
    wrongPassword: "Le mot de passe actuel est incorrect.",
    changePassword: "Changer le mot de passe",
    changePasswordHelp:
      "Saisissez l’e-mail actuellement lié au compte. Un lien sécurisé sera envoyé.",
    accountEmail: "E-mail du compte",
    sendReset: "Envoyer l’e-mail de réinitialisation",
    resetSent:
      "E-mail envoyé. Ouvrez le lien pour choisir un nouveau mot de passe.",
    resetFailed: "L’e-mail de réinitialisation n’a pas pu être envoyé.",
    emailMismatch: "Saisissez l’e-mail actuellement lié au compte.",
    deleteAccount: "Supprimer le compte",
    deleteHelp:
      "Supprime définitivement ce compte et tout ce qui lui est associé.",
    deleteTitle: "Supprimer définitivement le compte ?",
    permanentWarning:
      "Cette action est irréversible. Vos compagnons, discussions, souvenirs, favoris, cadeaux, soldes, achats, profil et accès seront supprimés sans possibilité de récupération.",
    deleteEverything: "Supprimer tout ce qui est associé à mon compte.",
    understandPermanent:
      "Je comprends que cette suppression est définitive.",
    confirmDelete: "Supprimer définitivement le compte",
    deleteFailed: "Le compte n’a pas pu être supprimé.",
    cancel: "Annuler",
    working: "Un instant...",
    close: "Fermer"
  },
  DE: {
    accountActions: "Kontoaktionen",
    changeEmail: "E-Mail ändern",
    changeEmailHelp:
      "Gib dein aktuelles Passwort ein. Vor der Aktivierung werden Bestätigungslinks gesendet.",
    currentPassword: "Aktuelles Passwort",
    newEmail: "Neue E-Mail",
    sendEmailChange: "Bestätigungslinks senden",
    emailChangeSent:
      "Bestätigungs-E-Mail gesendet. Öffne den Link, bevor du die neue Adresse verwendest.",
    emailChangeFailed: "Die E-Mail-Änderung konnte nicht gestartet werden.",
    wrongPassword: "Das aktuelle Passwort ist falsch.",
    changePassword: "Passwort ändern",
    changePasswordHelp:
      "Gib die derzeit mit dem Konto verbundene E-Mail ein. Ein sicherer Link wird gesendet.",
    accountEmail: "Konto-E-Mail",
    sendReset: "Passwort-Reset senden",
    resetSent:
      "E-Mail gesendet. Öffne den Link, um ein neues Passwort festzulegen.",
    resetFailed: "Die Passwort-E-Mail konnte nicht gesendet werden.",
    emailMismatch: "Gib die aktuell verbundene E-Mail ein.",
    deleteAccount: "Konto löschen",
    deleteHelp:
      "Dieses Konto und alle verbundenen Inhalte dauerhaft löschen.",
    deleteTitle: "Konto dauerhaft löschen?",
    permanentWarning:
      "Dies kann nicht rückgängig gemacht werden. Begleiter, Chats, Erinnerungen, Favoriten, Geschenke, Guthaben, Käufe, Profil und Kontozugang werden unwiederbringlich gelöscht.",
    deleteEverything: "Alles löschen, was mit meinem Konto verbunden ist.",
    understandPermanent:
      "Ich verstehe, dass diese Löschung dauerhaft ist.",
    confirmDelete: "Konto dauerhaft löschen",
    deleteFailed: "Das Konto konnte nicht gelöscht werden.",
    cancel: "Abbrechen",
    working: "Einen Moment...",
    close: "Schließen"
  },
  JA: {
    accountActions: "アカウント操作",
    changeEmail: "メールアドレスを変更",
    changeEmailHelp:
      "現在のパスワードを入力してください。新しいメールが有効になる前に確認リンクが送信されます。",
    currentPassword: "現在のパスワード",
    newEmail: "新しいメールアドレス",
    sendEmailChange: "確認リンクを送信",
    emailChangeSent:
      "確認メールを送信しました。新しいアドレスを使う前にリンクを開いてください。",
    emailChangeFailed: "メール変更を開始できませんでした。",
    wrongPassword: "現在のパスワードが正しくありません。",
    changePassword: "パスワードを変更",
    changePasswordHelp:
      "現在このアカウントに登録されているメールを入力してください。安全なリセットリンクを送信します。",
    accountEmail: "アカウントのメール",
    sendReset: "リセットメールを送信",
    resetSent:
      "リセットメールを送信しました。リンクを開いて新しいパスワードを設定してください。",
    resetFailed: "リセットメールを送信できませんでした。",
    emailMismatch: "現在登録されているメールを入力してください。",
    deleteAccount: "アカウントを削除",
    deleteHelp:
      "このアカウントと関連するすべてを完全に削除します。",
    deleteTitle: "アカウントを完全に削除しますか？",
    permanentWarning:
      "元に戻せません。コンパニオン、チャット、メモリー、お気に入り、ギフト、残高、購入履歴、プロフィール、アクセス権が削除され、復元できません。",
    deleteEverything: "アカウントに関連するすべてを削除する。",
    understandPermanent: "削除が永久であることを理解しました。",
    confirmDelete: "アカウントを完全に削除",
    deleteFailed: "アカウントを削除できませんでした。",
    cancel: "キャンセル",
    working: "処理中...",
    close: "閉じる"
  },
  KO: {
    accountActions: "계정 작업",
    changeEmail: "이메일 변경",
    changeEmailHelp:
      "현재 비밀번호를 입력하세요. 새 이메일이 활성화되기 전에 확인 링크가 전송됩니다.",
    currentPassword: "현재 비밀번호",
    newEmail: "새 이메일",
    sendEmailChange: "확인 링크 보내기",
    emailChangeSent:
      "확인 이메일을 보냈습니다. 새 주소를 사용하기 전에 링크를 열어 주세요.",
    emailChangeFailed: "이메일 변경을 시작할 수 없습니다.",
    wrongPassword: "현재 비밀번호가 올바르지 않습니다.",
    changePassword: "비밀번호 변경",
    changePasswordHelp:
      "현재 계정에 연결된 이메일을 입력하세요. 안전한 재설정 링크가 전송됩니다.",
    accountEmail: "계정 이메일",
    sendReset: "비밀번호 재설정 이메일 보내기",
    resetSent:
      "재설정 이메일을 보냈습니다. 링크를 열어 새 비밀번호를 설정하세요.",
    resetFailed: "재설정 이메일을 보낼 수 없습니다.",
    emailMismatch: "현재 계정에 연결된 이메일을 입력하세요.",
    deleteAccount: "계정 삭제",
    deleteHelp:
      "이 계정과 연결된 모든 내용을 영구적으로 삭제합니다.",
    deleteTitle: "계정을 영구적으로 삭제할까요?",
    permanentWarning:
      "되돌릴 수 없습니다. 컴패니언, 채팅, 메모리, 즐겨찾기, 선물, 잔액, 구매 내역, 프로필과 계정 접근 권한이 삭제되며 복구할 수 없습니다.",
    deleteEverything: "내 계정과 연결된 모든 내용을 삭제합니다.",
    understandPermanent: "이 삭제가 영구적임을 이해합니다.",
    confirmDelete: "계정 영구 삭제",
    deleteFailed: "계정을 삭제할 수 없습니다.",
    cancel: "취소",
    working: "잠시만요...",
    close: "닫기"
  }
};

export function AccountSettingsActions({
  session,
  currentEmail
}: {
  session: Session;
  currentEmail: string;
}) {
  const { language } = useSiteLanguage();
  const copy = COPY[language] ?? COPY.EN;
  const [mode, setMode] = useState<Mode>(null);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [resetEmail, setResetEmail] = useState(currentEmail);
  const [confirmedDelete, setConfirmedDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setResetEmail(currentEmail);
  }, [currentEmail]);

  useEffect(() => {
    if (!mode) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        closeModal();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () =>
      window.removeEventListener("keydown", closeOnEscape);
  }, [loading, mode]);

  function openModal(nextMode: Exclude<Mode, null>) {
    setMode(nextMode);
    setError("");
    setNotice("");
    setConfirmedDelete(false);
    if (nextMode === "password") {
      setResetEmail(currentEmail);
    }
  }

  function closeModal() {
    if (loading) return;
    setMode(null);
    setError("");
    setNotice("");
    setCurrentPassword("");
    setNewEmail("");
    setConfirmedDelete(false);
  }

  async function changeEmail() {
    if (loading) return;
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/account/change-email", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword,
          newEmail
        })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (payload?.error === "INVALID_PASSWORD") {
          throw new Error(copy.wrongPassword);
        }
        throw new Error(copy.emailChangeFailed);
      }

      setNotice(copy.emailChangeSent);
      setCurrentPassword("");
      setNewEmail("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : copy.emailChangeFailed
      );
    } finally {
      setLoading(false);
    }
  }

  async function requestPasswordReset() {
    if (loading) return;
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        "/api/account/request-password-reset",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email: resetEmail })
        }
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (payload?.error === "EMAIL_MISMATCH") {
          throw new Error(copy.emailMismatch);
        }
        throw new Error(copy.resetFailed);
      }

      setNotice(copy.resetSent);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : copy.resetFailed
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteAccount() {
    if (loading || !confirmedDelete) return;
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof payload?.message === "string"
            ? payload.message
            : copy.deleteFailed
        );
      }

      await getSupabaseBrowserClient()?.auth.signOut();
      window.location.assign("/");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : copy.deleteFailed
      );
      setLoading(false);
    }
  }

  return (
    <>
      <div className="border-t border-white/10 py-5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-bond-rose">
          {copy.accountActions}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => openModal("email")}
            className="rounded-2xl border border-bond-rose/35 bg-bond-rose/[0.06] p-4 text-left transition hover:bg-bond-rose/[0.12]"
          >
            <Mail size={20} className="text-bond-rose" />
            <span className="mt-3 block font-bold text-white">
              {copy.changeEmail}
            </span>
          </button>
          <button
            type="button"
            onClick={() => openModal("password")}
            className="rounded-2xl border border-bond-rose/35 bg-bond-rose/[0.06] p-4 text-left transition hover:bg-bond-rose/[0.12]"
          >
            <KeyRound size={20} className="text-bond-rose" />
            <span className="mt-3 block font-bold text-white">
              {copy.changePassword}
            </span>
          </button>
          <button
            type="button"
            onClick={() => openModal("delete")}
            className="rounded-2xl border border-red-400/35 bg-red-500/[0.05] p-4 text-left transition hover:bg-red-500/[0.10]"
          >
            <Trash2 size={20} className="text-red-300" />
            <span className="mt-3 block font-bold text-red-100">
              {copy.deleteAccount}
            </span>
          </button>
        </div>
      </div>

      {mode && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !loading
            ) {
              closeModal();
            }
          }}
        >
          <div className="relative my-auto w-full max-w-lg rounded-[2rem] border border-bond-rose/60 bg-bond-card p-6 shadow-[0_0_42px_rgba(255,92,168,0.25)] md:p-8">
            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className="absolute right-4 top-4 rounded-full bg-black/45 p-2 text-bond-muted transition hover:text-white disabled:opacity-50"
              aria-label={copy.close}
            >
              <X size={18} />
            </button>

            {mode === "email" && (
              <>
                <h2 className="pr-10 font-display text-3xl font-bold text-bond-rose">
                  {copy.changeEmail}
                </h2>
                <p className="mt-3 text-sm leading-6 text-bond-muted">
                  {copy.changeEmailHelp}
                </p>
                <div className="mt-6 space-y-3">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(event) =>
                      setNewEmail(event.target.value)
                    }
                    autoComplete="email"
                    placeholder={copy.newEmail}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-bond-rose/70"
                  />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    placeholder={copy.currentPassword}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-bond-rose/70"
                  />
                  <button
                    type="button"
                    onClick={() => void changeEmail()}
                    disabled={
                      loading ||
                      !newEmail.trim() ||
                      !currentPassword
                    }
                    className="bond-pink-button w-full rounded-xl bg-bond-rose px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {loading
                      ? copy.working
                      : copy.sendEmailChange}
                  </button>
                </div>
              </>
            )}

            {mode === "password" && (
              <>
                <h2 className="pr-10 font-display text-3xl font-bold text-bond-rose">
                  {copy.changePassword}
                </h2>
                <p className="mt-3 text-sm leading-6 text-bond-muted">
                  {copy.changePasswordHelp}
                </p>
                <div className="mt-6 space-y-3">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(event) =>
                      setResetEmail(event.target.value)
                    }
                    autoComplete="email"
                    placeholder={copy.accountEmail}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-bond-rose/70"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      void requestPasswordReset()
                    }
                    disabled={loading || !resetEmail.trim()}
                    className="bond-pink-button w-full rounded-xl bg-bond-rose px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {loading ? copy.working : copy.sendReset}
                  </button>
                </div>
              </>
            )}

            {mode === "delete" && (
              <>
                <div className="flex items-start gap-4 pr-10">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                    <AlertTriangle size={24} />
                  </span>
                  <div>
                    <h2 className="font-display text-3xl font-bold text-red-200">
                      {copy.deleteTitle}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-red-100/80">
                      {copy.permanentWarning}
                    </p>
                  </div>
                </div>

                <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-red-400/25 bg-red-500/[0.06] p-4">
                  <input
                    type="checkbox"
                    checked={confirmedDelete}
                    onChange={(event) =>
                      setConfirmedDelete(
                        event.target.checked
                      )
                    }
                    className="mt-1 h-4 w-4 accent-red-500"
                  />
                  <span className="text-sm leading-6 text-red-100">
                    {copy.deleteEverything}
                    <strong className="mt-1 block">
                      {copy.understandPermanent}
                    </strong>
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => void deleteAccount()}
                  disabled={loading || !confirmedDelete}
                  className="mt-5 w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-50"
                >
                  {loading
                    ? copy.working
                    : copy.confirmDelete}
                </button>
              </>
            )}

            {error && (
              <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </p>
            )}
            {notice && (
              <p className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {notice}
              </p>
            )}

            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className="mt-4 w-full rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:border-bond-rose/40 disabled:opacity-50"
            >
              {copy.cancel}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
