import { motion } from "framer-motion";

const Analysis = () => {
    const contentSchedule = [
        {
            day: "Monday",
            time: "9:20",
            content: "How to make a content grid",
            format: "Post - blog",
            channel: "Blog",
            complementaryLink: "Facebook",
        },
        {
            day: "Wednesday",
            time: "15:30",
            content: "Evolution of digital content 2020-2021",
            format: "Infographic",
            channel: "Blog",
            complementaryLink: "Instagram Story",
        },
        {
            day: "Saturday",
            time: "TBD",
            content: "Content",
            format: "Format",
            channel: "Channel",
            complementaryLink: "Content distribution channel",
        },
        {
            day: "Sunday",
            time: "TBD",
            content: "Content",
            format: "Format",
            channel: "Channel",
            complementaryLink: "Link",
        },
    ];

    const analysisRules = [
        { id: 1, name: "Content", color: "bg-pink-500" },
        { id: 2, name: "Channel", color: "bg-blue-500" },
        { id: 3, name: "Format", color: "bg-purple-500" },
        { id: 4, name: "Complementary Link", color: "bg-orange-500" },
        { id: 5, name: "Table Data", color: "bg-green-500" },
        { id: 6, name: "Date", color: "bg-red-500" },
    ];

    return (
        <section className='p-3 rounded-md mt-12 sm:mt-0'>
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Enhanced Table Section */}
                <div className="lg:w-[70%]">
                    <div className="bg-white bg-opacity-40 backdrop-blur-md shadow-xl rounded-xl overflow-hidden border border-gray-200/30">
                        <div className="p-4 border-b border-gray-200/30 backdrop-blur-md">
                            <h2 className="text-xl font-semibold text-gray-800">Content Schedule</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200/30">
                                <thead className="bg-gray-50/50 backdrop-blur-sm">
                                    <tr>
                                        {["Day", "Time", "Content", "Format", "Channel", "Complementary Link"].map((header) => (
                                            <th key={header} className="px-4 py-3.5 text-left text-sm font-semibold text-gray-700">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200/30 bg-white/20">
                                    {contentSchedule.map((item, index) => (
                                        <tr key={index} className="hover:bg-white/30 transition-all duration-200">
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.day}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{item.time}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{item.content}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{item.format}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{item.channel}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{item.complementaryLink}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Enhanced Analysis Section */}
                <div className="lg:w-[30%]">
                    <div className="bg-white/30 backdrop-blur-md shadow-xl rounded-xl p-6 border border-gray-200/30">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Analysis Rules</h2>
                        <div className="space-y-4">
                            {analysisRules.map((rule) => (
                                <motion.div
                                    key={rule.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: rule.id * 0.1 }}
                                    className="relative overflow-hidden rounded-lg bg-white/40 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="flex items-center p-4">
                                        <div className={`${rule.color} w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold mr-3`}>
                                            {rule.id}
                                        </div>
                                        <span className="text-gray-700 font-medium">{rule.name}</span>
                                        <div className="ml-auto">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 accent-themeBlue rounded cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div className={`h-1 ${rule.color} opacity-50`} />
                                </motion.div>
                            ))}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full mt-6 bg-gradient-to-r from-themeBlue to-blue-600 text-white py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                            >
                                Save Rules
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Analysis;
