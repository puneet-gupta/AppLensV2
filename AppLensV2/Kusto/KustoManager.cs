using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Kusto.Data;
using Kusto.Data.Common;
using Kusto.Data.Net.Client;

namespace AppLensV2
{
    /// <summary>
    /// Kusto Manager
    /// </summary>
    public sealed class KustoManager : IDisposable
    {
        /// <summary>
        /// Kusto Endpoint
        /// </summary>
        private const string KustoEndpoint = "https://{0}.kusto.windows.net:443/";
        
        private const string KustoAppId = "d3aa1eaa-156b-4954-983d-659e3d5a5f0b";

        private const string KustoAppKey = "jWP9DWtdNa8zSIm6XeLct44o/SBRi3CrX3jxrnTOCjE=";

        /// <summary>
        /// Maintains a Cluster-specific Kusto Query Client Collection
        /// </summary>
        private ConcurrentDictionary<string, ICslQueryProvider> _clusterSpecificQueryClientCollection = new ConcurrentDictionary<string, ICslQueryProvider>();

        /// <summary>
        /// Instance
        /// </summary>
        private static readonly Lazy<KustoManager> _instance = new Lazy<KustoManager>(() => new KustoManager());

        /// <summary>
        /// Instance
        /// </summary>
        public static KustoManager Instance
        {
            get
            {
                return _instance.Value;
            }
        }

        /// <summary>
        /// Constructor
        /// </summary>
        private KustoManager()
        {
        }

        /// <summary>
        /// Executes Kusto Query
        /// </summary>
        /// <param name="query">Query to execute</param>
        /// <returns>awaitable Task</returns>
        public async Task<DataTable> ExecuteQueryAsync(string query, string kustoClusterName, string kustoDBName)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                throw new ArgumentNullException("query");
            }
            
            //Get QueryClient
            ICslQueryProvider client = GetQueryClient(kustoClusterName, kustoDBName);

            if (client == null)
            {
                throw new Exception("Unable to initialize query client.");
            }

            var clientRequestProperties = new ClientRequestProperties();
            clientRequestProperties.ClientRequestId = Guid.NewGuid().ToString();
            clientRequestProperties.SetOption(ClientRequestProperties.OptionNoTruncation, true);

            IDataReader reader = null;

            try
            {
                reader = await client.ExecuteQueryAsync(client.DefaultDatabaseName, query, clientRequestProperties);

                var tableResult = new DataTable();
                tableResult.Load(reader);

                return tableResult;
            }
            catch (Exception ex)
            {
                throw new Exception(String.Format("Failed to Execute Kusto Query. Kusto ClientRequestId : {0}\nException : {1}",
                    clientRequestProperties.ClientRequestId, ex.ToString()));
            }
            finally
            {
                if (reader != null)
                {
                    reader.Close();
                    reader.Dispose();
                }
            }
        }

        /// <summary>
        /// Get Query Client
        /// </summary>
        /// <returns>Query Client</returns>
        private ICslQueryProvider GetQueryClient(string kustoClusterName, string kustoDBName)
        {
            if (String.IsNullOrWhiteSpace(kustoClusterName))
            {
                return null;
            }

            ICslQueryProvider client;
            if (!_clusterSpecificQueryClientCollection.TryGetValue(kustoClusterName.ToLower(), out client))
            {
                var connStringBuilder = new KustoConnectionStringBuilder(string.Format(KustoEndpoint, kustoClusterName), kustoDBName);
                connStringBuilder.FederatedSecurity = true;
                connStringBuilder.ApplicationClientId = KustoAppId;
                connStringBuilder.ApplicationKey = KustoAppKey;
                client = KustoClientFactory.CreateCslQueryProvider(connStringBuilder);
                _clusterSpecificQueryClientCollection.TryAdd(kustoClusterName.ToLower(), client);
            }

            return client;
        }

        /// <summary>
        /// Dispose
        /// </summary>
        public void Dispose()
        {
            try
            {
                foreach (var key in _clusterSpecificQueryClientCollection.Keys)
                {
                    ICslQueryProvider client = null;
                    _clusterSpecificQueryClientCollection.TryGetValue(key, out client);

                    if (client != null)
                    {
                        client.Dispose();
                    }
                }
            }
            finally
            {
                GC.SuppressFinalize(this);
            }
        }
    }
}