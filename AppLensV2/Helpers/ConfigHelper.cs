using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

namespace AppLensV2.Helpers
{
    public class ConfigHelper
    {
        /// <summary>
        /// Getting setting from configuration file
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public static string Evaluate(string input)
        {
            try
            {
                if (input == null)
                    return null;

                while (true)
                {
                    var match = Regex.Match(input, @"\[\[(.+?)\]\]", RegexOptions.Compiled);
                    if (!match.Success)
                        break;

                    var path = match.Groups[1].Value.Trim();
                    path = Environment.ExpandEnvironmentVariables(path);

                    if (!File.Exists(path))
                    {
                        throw new FileNotFoundException("Specified path not found", path);
                    }
                    var replacer = File.ReadAllText(path).Trim();
                    input = input.Substring(0, match.Index) + replacer + input.Substring(match.Index + match.Length);
                }

                return input;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public static string GetExceptionDetails(Exception ex)
        {
            var errorMessage = new StringBuilder();

            errorMessage.Append(ex.Message);
            errorMessage.Append(ex.StackTrace);

            if (ex.InnerException != null)
            {
                errorMessage.Append(ex.InnerException.Message);
                errorMessage.Append(ex.InnerException.StackTrace);
            }

            return errorMessage.ToString();
        }
    }
}