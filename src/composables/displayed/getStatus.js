import { useI18n } from "vue-i18n";

export default function getStatus(active, deleted_at) {
  const { t } = useI18n({ useScope: "global" });

  if (active) {
    return t('statuses.approved');
  } else if (deleted_at !== null) {
    return t('statuses.deleted');
  } else {
    return t('statuses.anApproved');
  }
}