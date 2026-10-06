using System;
using System.IO;
using System.Windows;

namespace WireTune
{
    public partial class App : Application
    {
        public static readonly string LogFile = Path.Combine(Path.GetTempPath(), "wiretune_app.log");

        public static void Log(string msg)
        {
            try
            {
                File.AppendAllText(LogFile, $"[{DateTime.Now:HH:mm:ss.fff}] {msg}\n");
            }
            catch { }
        }

        protected override void OnStartup(StartupEventArgs e)
        {
            AppDomain.CurrentDomain.UnhandledException += (s, ev) =>
            {
                Log($"[CRITICAL] AppDomain Unhandled: {ev.ExceptionObject}");
            };
            DispatcherUnhandledException += (s, ev) =>
            {
                Log($"[CRITICAL] Dispatcher Unhandled: {ev.Exception}");
            };
            Log("App OnStartup triggered");
            Exit += (s, ev) =>
            {
                Log($"App Exit event triggered, ExitCode={ev.ApplicationExitCode}");
            };
            base.OnStartup(e);
        }
    }
}
