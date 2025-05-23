"use client";
import { client } from "@/app/client";
import { CROWDFUNDING_FACTORY } from "@/app/constants/contracts";
import { MyCampaignCard } from "@/components/MyCampaignCard";
import { useState } from "react";
import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { deployPublishedContract } from "thirdweb/deploys";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { AiOutlineLoading } from "react-icons/ai";

export default function DashboardPage() {
  const account = useActiveAccount();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const contract = getContract({
    client: client,
    chain: baseSepolia,
    address: CROWDFUNDING_FACTORY,
  });

  // Get Campaigns
  const {
    data: myCampaigns,
    isLoading: isLoadingMyCampaigns,
    refetch,
  } = useReadContract({
    contract: contract,
    method:
      "function getUserCampaigns(address _user) view returns ((address campaignAddress, address owner, string name, uint256 creationTime)[])",
    params: [account?.address as string],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 mt-16 sm:px-6 lg:px-8">
      <div className="flex flex-row justify-between items-center mb-8">
        <p className="text-4xl font-extrabold bg-gradient-to-b from-pink-600 to-purple-700 bg-clip-text text-transparent mb-4">
          Dashboard
        </p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => setIsModalOpen(true)}
        >
          Create Campaign
        </button>
      </div>
      <p className="text-2xl font-semibold mb-4 text-blue-800">My Campaigns:</p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {isLoadingMyCampaigns && (
          <p className="text-3xl font-semibold text-blue-500 mb-4">
            Loading campaigns{" "}
            <AiOutlineLoading className="inline animate-spin" />
          </p>
        )}
        {!isLoadingMyCampaigns &&
          (myCampaigns && myCampaigns.length > 0 ? (
            myCampaigns.map((campaign, index) => (
              <MyCampaignCard
                key={index}
                contractAddress={campaign.campaignAddress}
              />
            ))
          ) : (
            <p>No campaigns</p>
          ))}
      </div>

      {isModalOpen && (
        <CreateCampaignModal
          setIsModalOpen={setIsModalOpen}
          refetch={refetch}
        />
      )}
    </div>
  );
}

type CreateCampaignModalProps = {
  setIsModalOpen: (value: boolean) => void;
  refetch: () => void;
};

const CreateCampaignModal = ({
  setIsModalOpen,
  refetch,
}: CreateCampaignModalProps) => {
  const account = useActiveAccount();
  const [isDeployingContract, setIsDeployingContract] =
    useState<boolean>(false);
  const [campaignName, setCampaignName] = useState<string>("");
  const [campaignDescription, setCampaignDescription] = useState<string>("");
  const [campaignGoal, setCampaignGoal] = useState<number>(1);
  const [campaignDeadline, setCampaignDeadline] = useState<number>(1);

  // Deploy contract from CrowdfundingFactory
  const handleDeployContract = async () => {
    setIsDeployingContract(true);
    try {
      console.log("Deploying contract...");
      const contractAddress = await deployPublishedContract({
        client: client,
        chain: baseSepolia,
        account: account!,
        contractId: "Crowdfunding",
        contractParams: {
          _name: campaignName,
          _description: campaignDescription,
          _goal: campaignGoal,
          _durationInDays: campaignDeadline,
        },
        publisher: process.env.NEXT_PUBLIC_PUBLISHER as string | undefined,
        version: process.env.NEXT_PUBLIC_VERSION as string | undefined,
      });
      alert("Contract deployed successfully!");
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeployingContract(false);
      setIsModalOpen(false);
      refetch;
    }
  };

  const handleCampaignGoal = (value: number) => {
    if (value < 1) {
      setCampaignGoal(1);
    } else {
      setCampaignGoal(value);
    }
  };

  const handleCampaignLength = (value: number) => {
    if (value < 1) {
      setCampaignDeadline(1);
    } else {
      setCampaignDeadline(value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center backdrop-blur-md">
      <div className="sm:w-1/2 bg-slate-100 p-6 rounded-md">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-semibold">Create a Campaign</p>
          <button
            className="text-sm px-4 py-2 bg-slate-600 text-white rounded-md"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </button>
        </div>
        <div className="flex flex-col">
          <label>Campaign Name:</label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Campaign Name"
            className="mb-4 px-4 py-2 bg-slate-300 rounded-md"
          />
          <label>Campaign Description:</label>
          <textarea
            value={campaignDescription}
            onChange={(e) => setCampaignDescription(e.target.value)}
            placeholder="Campaign Description"
            className="mb-4 px-4 py-2 bg-slate-300 rounded-md"
          ></textarea>
          <label>Campaign Goal:</label>
          <input
            type="number"
            value={campaignGoal}
            onChange={(e) => handleCampaignGoal(parseInt(e.target.value))}
            className="mb-4 px-4 py-2 bg-slate-300 rounded-md"
          />
          <label>{`Campaign Length (Days)`}</label>

          <input
            type="number"
            value={campaignDeadline}
            onChange={(e) => handleCampaignLength(parseInt(e.target.value))}
            className="mb-4 px-4 py-2 bg-slate-300 rounded-md"
          />

          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={handleDeployContract}
          >
            {isDeployingContract ? "Creating Campaign..." : "Create Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
};
