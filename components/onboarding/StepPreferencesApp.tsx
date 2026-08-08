import {
  CurrencyCircleDollar,
  BellRinging,
  ChartLineUp,
  Wallet,
  DoorOpen,
  FileText,
  UploadSimple,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

type WidgetPriorite = "revenus" | "paiements" | "occupation" | "contrats";

interface StepPreferencesAppProps {
  devise: string;
  notifEmail: boolean;
  widgetPriorite: WidgetPriorite | null;
  onChangeNotifEmail: (v: boolean) => void;
  onChangeWidget: (v: WidgetPriorite) => void;
  onNext: () => void;
}

const widgets: { value: WidgetPriorite; label: string; icon: typeof Wallet }[] = [
  { value: "revenus", label: "Revenus", icon: ChartLineUp },
  { value: "paiements", label: "Paiements", icon: Wallet },
  { value: "occupation", label: "Occupation", icon: DoorOpen },
  { value: "contrats", label: "Contrats", icon: FileText },
];

export default function StepPreferencesApp({
  devise,
  notifEmail,
  widgetPriorite,
  onChangeNotifEmail,
  onChangeWidget,
  onNext,
}: StepPreferencesAppProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
          <CurrencyCircleDollar size={15} /> Devise
        </label>
        <div className="h-10 px-3 rounded-md border border-neutral-200 bg-neutral-50 text-sm text-neutral-600 flex items-center">
          {devise} <span className="text-xs text-neutral-400 ml-2">(par défaut)</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
          <BellRinging size={15} /> Comment voulez-vous être prévenu des échéances ?
        </label>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={notifEmail}
              onChange={(e) => onChangeNotifEmail(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            Email
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-400">
            <input type="checkbox" disabled className="h-4 w-4 rounded border-neutral-300" />
            SMS <span className="text-xs">(bientôt)</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-400">
            <input type="checkbox" disabled className="h-4 w-4 rounded border-neutral-300" />
            WhatsApp <span className="text-xs">(bientôt)</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Que voulez-vous suivre en priorité sur votre tableau de bord ?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {widgets.map((w) => {
            const Icon = w.icon;
            const isSelected = widgetPriorite === w.value;
            return (
              <button
                key={w.value}
                type="button"
                onClick={() => onChangeWidget(w.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm font-medium ${
                  isSelected
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <Icon
                  size={16}
                  weight={isSelected ? "fill" : "regular"}
                  className={isSelected ? "text-primary-600" : "text-neutral-400"}
                />
                {w.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">
          Logo pour vos quittances <span className="text-xs text-neutral-400">(optionnel)</span>
        </label>
        <button
          type="button"
          className="w-full h-10 px-3 rounded-md border border-dashed border-neutral-300 text-sm text-neutral-500 flex items-center justify-center gap-2 hover:bg-neutral-50"
        >
          <UploadSimple size={16} />
          Ajouter un logo
        </button>
        <p className="text-xs text-neutral-400">
          Vous pourrez l&apos;ajouter à tout moment depuis les paramètres.
        </p>
      </div>

      <Button onClick={onNext} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
