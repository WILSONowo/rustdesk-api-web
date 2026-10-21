<template>
  <section class="connection-guide">
    <h3>{{ T('SetupVerify') }}</h3>
    <p>{{ T('AccountPasswordBoundary') }}</p>
    <el-radio-group v-model="scenario" :aria-label="T('ConnectionScenario')">
      <el-radio-button value="own">{{ T('OwnComputer') }}</el-radio-button>
      <el-radio-button value="help">{{ T('HelpSomeone') }}</el-radio-button>
    </el-radio-group>
    <ol v-if="scenario === 'own'">
      <li>{{ T('UnattendedService') }}</li><li>{{ T('UnattendedPassword') }}</li><li>{{ T('UnattendedVerify') }}</li>
    </ol>
    <ol v-else><li>{{ T('HelpInstall') }}</li><li>{{ T('HelpCode') }}</li><li>{{ T('HelpFinish') }}</li></ol>
    <el-alert :title="T('EndpointVerificationBoundary')" type="info" :closable="false" />
    <div class="actions">
      <el-button :loading="checking" @click="check">{{ T('CheckAccountService') }}</el-button>
      <el-button :disabled="!report" @click="downloadReport">{{ T('ExportDiagnostics') }}</el-button>
    </div>
    <template v-if="report">
      <p>{{ T('DiagnosticId') }}: {{ report.diagnostic_id }} · {{ report.checked_at }}</p>
      <el-alert v-if="failed" :title="T('ServiceCheckFailed')" type="error" :closable="false" />
      <ul v-else>
        <li v-for="[key, label] in checks" :key="key">{{ T(label) }}: {{ T(report[key] ? 'CheckPassed' : 'CheckNeedsAttention') }}</li>
        <li>{{ T(report.device_telemetry ? 'TelemetryMayReport' : 'TelemetryUnavailable') }}</li>
      </ul>
    </template>
    <el-collapse>
      <el-collapse-item v-for="issue in issues" :key="issue" :title="T(issue)"><p>{{ T(issue + 'Help') }}</p></el-collapse-item>
    </el-collapse>
    <p>{{ T('DiagnosticsPrivacy') }}</p>
  </section>
</template>
<script setup>
import { ref } from 'vue'
import { T } from '@/utils/i18n'
import { getReadiness } from '@/api/connection'
import { downBlob } from '@/utils/file'
const scenario = ref('own'), checking = ref(false), failed = ref(false), report = ref(null)
const checks = [['account_service', 'AccountService'], ['database', 'AccountDatabase'], ['resources_loaded', 'ResourceSettings'], ['downloads_configured', 'ClientDownloads'], ['import_code_configured', 'ServerImportCode'], ['id_server_configured', 'IdServerSettings'], ['public_key_valid', 'PublicKeyFormat']]
const issues = ['IssueConfiguration', 'IssueOffline', 'IssueAccount', 'IssueRelay', 'IssuePermissions', 'IssueWake']
async function check() {
  if (checking.value) return
  checking.value = true
  report.value = null
  failed.value = false
  try {
    const { data } = await getReadiness()
    // Export only known fields; never include raw requests, headers or errors.
    report.value = { diagnostic_id: data.diagnostic_id, checked_at: data.checked_at, endpoint_connection: 'not_tested', device_telemetry: data.device_telemetry === true }
    for (const [key] of checks) report.value[key] = data[key] === true
  } catch {
    failed.value = true
    report.value = { diagnostic_id: globalThis.crypto?.randomUUID?.() || 'local-check', checked_at: new Date().toISOString(), account_service: 'unavailable', endpoint_connection: 'not_tested' }
  } finally { checking.value = false }
}
function downloadReport() {
  downBlob(new Blob([JSON.stringify(report.value, null, 2)], { type: 'application/json' }), 'connection-diagnostics.json')
}
</script>
<style scoped>
.connection-guide { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--el-border-color-lighter); }
p, li { font-size: 14px; line-height: 1.8; overflow-wrap: anywhere; }
.actions { display: flex; flex-wrap: wrap; gap: 12px; margin: 16px 0; }
.actions .el-button { margin-left: 0; }
</style>
